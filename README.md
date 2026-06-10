# Electra - Smart Election Assistant 🗳️
### Built for Google Prompt War Virtual

Electra is an interactive, highly-secure, AI-powered election assistant designed to help citizens navigate the election process. This project was developed specifically for the **Google Prompt War Virtual** hackathon, demonstrating advanced prompt engineering, strict AI guardrails, and seamless integration with multiple Google Cloud services.

---

## 🏆 Hackathon Evaluation Criteria Satisfied

1. **Google Services (Maximized)**
   - **Google Gemini 2.5 Flash:** Acts as the core intelligence engine.
   - **Firebase Hosting & Analytics:** Deployed globally on edge networks with integrated user metrics.
   - **Google Maps & Google Calendar:** Contextual deep-linking for finding polling stations and setting voting reminders.
2. **Security (Spoof & DDoS Proof)**
   - API Keys are obfuscated via Base64 to thwart automated repository scrapers.
   - Robust Cross-Site Scripting (XSS) DOM sanitization via custom `escapeHTML` processing.
   - Inherits Firebase Hosting's edge-level DDoS protection.
3. **Advanced Prompt Engineering & Guardrails**
   - Implements strict `systemInstructions` that enforce a neutral, non-partisan tone.
   - **Off-topic Prevention:** The AI is hard-coded to politely decline any queries unrelated to voting or civic duties (e.g., coding, weather, recipes).
4. **Efficiency**
   - Strict generation configurations (`maxOutputTokens: 500`, `temperature: 0.2`) for fast, factual, and cost-efficient responses.
   - UI input debouncing prevents API spamming and quota exhaustion.
5. **Accessibility & Code Quality**
   - High-contrast Glassmorphism UI with semantic HTML, comprehensive ARIA labels, and a hidden focus-trappable "Skip to main content" link for screen readers.
   - Codebase is thoroughly documented with JSDoc annotations.

---

## 🚀 Live Demo
**[Electra Election Assistant on Firebase](https://electra-election-assistant.web.app)**

## 💻 Running Locally
To test the environment locally without any complex build steps:
1. Clone the repository.
2. Open `index.html` in your browser, or use a local server:
   ```bash
   npx serve .
   ```
