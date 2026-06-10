const { GoogleGenerativeAI } = require('@google/generative-ai');

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

const rateLimitCache = new Map();

module.exports = async (req, res) => {
    // Handle CORS (Vercel edge functions often need manual CORS handling)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        // req.headers['x-forwarded-for'] is the standard way to get IP on Vercel
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        const currentTime = Date.now();
        
        // Backend Rate Limiting Check
        if (rateLimitCache.has(clientIp)) {
            const lastRequestTime = rateLimitCache.get(clientIp);
            if (currentTime - lastRequestTime < 10000) {
                return res.status(429).json({ error: "Too many requests. Please wait 10 seconds." });
            }
        }
        rateLimitCache.set(clientIp, currentTime);

        const { message, history } = req.body || {};
        
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
        
        return res.status(200).json({ text: responseText });
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return res.status(500).json({ error: "Failed to connect to AI assistant. Please try again later." });
    }
};
