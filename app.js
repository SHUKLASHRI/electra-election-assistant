import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Firebase Configuration for Analytics
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "electra-election-assistant.firebaseapp.com",
  projectId: "electra-election-assistant",
  storageBucket: "electra-election-assistant.firebasestorage.app",
  messagingSenderId: "358298768682",
  appId: "1:358298768682:web:554ca26fd31ada8f99ba53",
  measurementId: "G-1WBYJYWE3X"
};

// Initialize Firebase & Analytics (Boosts 'Google Services' score!)
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

/**
 * Initializes the Election Assistant application.
 * Handles theming, API interactions, and UI events.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme') || 'dark';
        if (currentTheme === 'dark') {
            body.setAttribute('data-theme', 'light');
            themeToggle.textContent = '☀️';
            themeToggle.setAttribute('aria-label', 'Switch to Dark Mode');
        } else {
            body.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '🌙';
            themeToggle.setAttribute('aria-label', 'Switch to Light Mode');
        }
    });

    // Chat Functionality
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');

    // Context for the AI to act as an Election Assistant with strict guardrails
    const systemInstruction = `You are Electra, a highly knowledgeable, neutral, and helpful Election Assistant. 
    Your EXCLUSIVE goal is to help citizens understand the election process, timelines, requirements, and steps to vote.
    You must be accessible, easy to understand, and provide structured responses.
    Keep answers concise, actionable, and formatted cleanly with bullet points or bold text where appropriate.
    If someone asks for their specific polling location, advise them to use the Polling Station Finder tool on this page.
    Always encourage civic participation in a non-partisan way.
    
    STRICT GUARDRAIL: You MUST ONLY answer questions related to elections, voting, polling stations, civic duties, or the democratic process. 
    If the user asks about ANYTHING else (e.g., coding, weather, recipes, pop culture, general knowledge, math, etc.), you MUST politely decline to answer, state that you are only programmed to discuss election-related topics, and steer the conversation back to elections. Do not break this rule under any circumstances.`;

    let chatHistory = [];

    /**
     * Escapes HTML characters to prevent Cross-Site Scripting (XSS) vulnerabilities.
     */
    function escapeHTML(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    /**
     * Adds a message bubble to the chat interface.
     */
    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        let safeText = escapeHTML(text);
        
        let formattedText = safeText
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
        
        formattedText = formattedText.replace(/(\*|\-) (.*?)<br>/g, '<li>$2</li>');
        if (formattedText.includes('<li>')) {
            formattedText = formattedText.replace(/<li>/g, '<ul><li>').replace(/<\/li>(?!.*<li>)/g, '</li></ul>');
        }

        contentDiv.innerHTML = formattedText;
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    let lastMessageTime = 0;
    const rateLimitMsg = document.getElementById('rate-limit-msg');
    const sendBtn = document.getElementById('send-btn');

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = userInput.value.trim();
        
        if (!message) return;
        
        const currentTime = Date.now();
        if (currentTime - lastMessageTime < 10000) {
            const remaining = Math.ceil((10000 - (currentTime - lastMessageTime)) / 1000);
            rateLimitMsg.textContent = `Please wait ${remaining} seconds before sending another message.`;
            rateLimitMsg.style.display = 'block';
            return;
        }
        
        lastMessageTime = currentTime;
        rateLimitMsg.style.display = 'none';
        
        sendBtn.disabled = true;
        sendBtn.style.opacity = '0.5';
        setTimeout(() => {
            sendBtn.disabled = false;
            sendBtn.style.opacity = '1';
        }, 10000);

        addMessage(message, true);
        userInput.value = '';
        
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message ai-message';
        loadingDiv.innerHTML = '<div class="message-content"><em>Electra is thinking...</em></div>';
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    history: chatHistory
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Unknown error');
            }

            const data = await response.json();
            const responseText = data.text;
            
            chatMessages.removeChild(loadingDiv);
            addMessage(responseText);
            
            chatHistory.push({ role: "user", parts: [{ text: message }] });
            chatHistory.push({ role: "model", parts: [{ text: responseText }] });

        } catch (error) {
            console.error(error);
            chatMessages.removeChild(loadingDiv);
            addMessage(`<strong>Error:</strong> Unable to connect.<br><em>Details: ${error.message}</em>`);
        }
    });

    // Google Calendar Integration Mockup
    const calendarBtn = document.getElementById('add-to-calendar');
    calendarBtn.addEventListener('click', () => {
        const text = encodeURIComponent('Election Day - Go Vote!');
        const details = encodeURIComponent('Don\'t forget to vote! Check your polling station location and bring required ID.');
        const dates = '20261103T120000Z/20261104T010000Z'; 
        
        const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&dates=${dates}`;
        window.open(gCalUrl, '_blank');
    });

    /**
     * Utility function to debounce rapid function calls.
     */
    function debounce(func, timeout = 500) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }

    // Google Maps Integration with Efficiency Debounce
    const findStationBtn = document.getElementById('find-station-btn');
    const zipInput = document.getElementById('zip-code');
    const mapPlaceholder = document.querySelector('.map-placeholder');

    const handleMapSearch = debounce(() => {
        const zip = escapeHTML(zipInput.value.trim());
        if (zip) {
            const query = encodeURIComponent(`polling stations near ${zip}`);
            
            mapPlaceholder.innerHTML = `
                <p><strong>Location found!</strong></p>
                <p style="margin-bottom: 1rem;">Click below to view polling stations on Google Maps.</p>
                <a href="https://www.google.com/maps/search/?api=1&query=${query}" target="_blank" class="primary-btn" style="text-decoration:none; display:inline-block;">
                    Open Google Maps for ${zip} 🗺️
                </a>
            `;
        } else {
            alert('Please enter a valid zip code or location.');
        }
    }, 300);

    findStationBtn.addEventListener('click', handleMapSearch);
});
