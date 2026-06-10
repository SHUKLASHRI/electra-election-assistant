const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemInstruction = `You are a specialized API that provides factual election information based on a ZIP code or PIN code.
You must return your response ONLY as a valid JSON object, with no markdown formatting, no backticks, and no extra text.
The JSON object must perfectly match this structure:
{
  "hasElection": boolean (true if there is a known upcoming or ongoing election for this area in 2026, false otherwise),
  "electionName": string (The name of the election, or null if hasElection is false),
  "pollingStationQuery": string (A Google Maps search query string for polling stations in this area, e.g., "polling stations near 90210". If hasElection is false, return an empty string ""),
  "timeline": array of objects (If hasElection is true, provide 2-3 key upcoming dates for this election. Each object must have "title" (string), "date" (string), and "description" (string). If hasElection is false, return an empty array [])
}

Do not include any extra text outside the JSON object. Do not format as a code block.`;

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { zip } = req.body || {};
        
        if (!zip || typeof zip !== 'string' || zip.trim().length === 0) {
            return res.status(400).json({ error: "A valid zip/pin code string is required." });
        }

        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction 
        });

        const prompt = `Provide election information for the postal code: ${zip}. Remember, output ONLY valid JSON.`;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.1,
                responseMimeType: "application/json"
            }
        });

        const responseText = result.response.text();
        
        // Ensure the response is valid JSON
        let jsonResponse;
        try {
            jsonResponse = JSON.parse(responseText);
        } catch (e) {
            console.error("Gemini did not return valid JSON:", responseText);
             return res.status(500).json({ error: "Failed to parse election data from AI." });
        }

        return res.status(200).json(jsonResponse);

    } catch (error) {
        console.error("Error calling Gemini API for elections:", error);
        return res.status(500).json({ error: "Failed to connect to election data service." });
    }
};
