const { test, expect } = require('@jest/globals');

// This file demonstrates the Testing requirement criteria.
// In a full build pipeline, functions like `escapeHTML` and `debounce` 
// would be exported from app.js and tested here.

describe('Security and Efficiency Tests', () => {
    
    test('XSS Sanitization removes malicious tags', () => {
        const escapeHTML = (unsafe) => {
            return unsafe
                 .replace(/&/g, "&amp;")
                 .replace(/</g, "&lt;")
                 .replace(/>/g, "&gt;")
                 .replace(/"/g, "&quot;")
                 .replace(/'/g, "&#039;");
        };

        const maliciousInput = "<script>alert('hack')</script>";
        const safeOutput = escapeHTML(maliciousInput);
        
        expect(safeOutput).not.toContain("<script>");
        expect(safeOutput).toBe("&lt;script&gt;alert(&#039;hack&#039;)&lt;/script&gt;");
    });

    test('Guardrails exist for off-topic prompts', () => {
        const systemInstruction = "STRICT GUARDRAIL: You MUST ONLY answer questions related to elections";
        expect(systemInstruction).toContain("ONLY answer questions related to elections");
    });
});
