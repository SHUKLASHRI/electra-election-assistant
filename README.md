# Electra - Smart Election Assistant 🗳️

Electra is an interactive, highly-secure, AI-powered election assistant designed to help citizens navigate the election process. This personal project demonstrates advanced prompt engineering, strict AI guardrails, and seamless integration with multiple Google Cloud services, hosted on Vercel's serverless infrastructure.

---

## ✨ Features & Technologies

1. **Google Services Integration**
   - **Google Gemini 2.5 Flash:** Acts as the core intelligence engine.
   - **Google Maps & Google Calendar:** Contextual deep-linking for finding polling stations and setting voting reminders.
2. **Security & Architecture**
   - Backend API built with Vercel Serverless Functions to securely hide the Gemini API Key.
   - Robust Cross-Site Scripting (XSS) DOM sanitization via custom `escapeHTML` processing.
   - Backend rate limiting to prevent abuse and quota exhaustion.
3. **Advanced Prompt Engineering & Guardrails**
   - Implements strict `systemInstructions` that enforce a neutral, non-partisan tone.
   - **Off-topic Prevention:** The AI is hard-coded to politely decline any queries unrelated to voting or civic duties (e.g., coding, weather, recipes).
4. **Efficiency**
   - Strict generation configurations (`maxOutputTokens: 500`, `temperature: 0.2`) for fast, factual, and cost-efficient responses.
   - UI input debouncing prevents API spamming.
5. **Accessibility & Design**
   - High-contrast Glassmorphism UI with semantic HTML, comprehensive ARIA labels, and a hidden focus-trappable "Skip to main content" link for screen readers.
   - Responsive design tailored for both mobile and desktop users.

---

## 🚀 Live Demo
**[Electra Election Assistant on Vercel](https://your-vercel-deployment-url.vercel.app)** *(Note: Replace with your actual Vercel URL)*

## 💻 Running Locally

To run the application locally with the serverless backend:

1. Clone the repository.
2. Install the Vercel CLI if you haven't already:
   ```bash
   npm i -g vercel
   ```
3. Create a `.env` file in the root directory and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```
4. Start the local Vercel development server:
   ```bash
   vercel dev
   ```
5. Open `http://localhost:3000` in your browser.
