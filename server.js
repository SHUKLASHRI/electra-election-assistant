/**
 * @fileoverview Express Server for Electra Election Assistant
 * Provides a secure backend API to interface with Google Gemini.
 * Maximizes security by keeping the API key out of the client browser.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS) from the current directory
app.use(express.static(__dirname));

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemInstruction = `You are Electra, a highly knowledgeable, neutral, and helpful Election Assistant. 
Your EXCLUSIVE goal is to help citizens understand the election process, timelines, requirements, and steps to vote.
You must be accessible, easy to understand, and provide structured responses.
Keep answers concise, actionable, and formatted cleanly with bullet points or bold text where appropriate.
If someone asks for their specific polling location, advise them to use the Polling Station Finder tool on this page.
Always encourage civic participation in a non-partisan way.

STRICT GUARDRAIL: You MUST ONLY answer questions related to elections, voting, polling stations, civic duties, or the democratic process. 
If the user asks about ANYTHING else (e.g., coding, weather, recipes, pop culture, general knowledge, math, etc.), you MUST politely decline to answer, state that you are only programmed to discuss election-related topics, and steer the conversation back to elections. Do not break this rule under any circumstances.`;

/**
 * Basic in-memory rate limiter to prevent abuse.
 * Limits users to 1 request every 10 seconds per IP.
 */
const rateLimitCache = new Map();

/**
 * POST /api/chat
 * Secure endpoint to communicate with the Gemini AI model.
 */
app.post('/api/chat', async (req, res) => {
    try {
        const clientIp = req.ip;
        const currentTime = Date.now();
        
        // Backend Rate Limiting Check
        if (rateLimitCache.has(clientIp)) {
            const lastRequestTime = rateLimitCache.get(clientIp);
            if (currentTime - lastRequestTime < 10000) {
                return res.status(429).json({ error: "Too many requests. Please wait 10 seconds." });
            }
        }
        rateLimitCache.set(clientIp, currentTime);

        const { message, history } = req.body;
        
        // Strict Input Validation
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ error: "A valid message string is required." });
        }

        if (message.length > 500) {
             return res.status(400).json({ error: "Message exceeds maximum length of 500 characters." });
        }

        // Initialize model with strict instructions
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction 
        });

        const chat = model.startChat({
            history: Array.isArray(history) ? history : [],
            generationConfig: {
                maxOutputTokens: 500, // Prevents excessive usage
                temperature: 0.2 // Keeps answers highly focused and factual
            },
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();
        
        res.json({ text: responseText });
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        res.status(500).json({ error: "Failed to connect to AI assistant. Please try again later." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Secure Backend Server running on http://localhost:${PORT}`);
});
