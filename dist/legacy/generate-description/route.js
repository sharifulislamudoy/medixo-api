"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
async function POST(req) {
    try {
        const { name, category } = await req.json();
        if (!name || !category) {
            return server_1.NextResponse.json({ error: "Product name and category are required" }, { status: 400 });
        }
        const prompt = `Generate an extremely short, one‑sentence description for the medicine "${name}" (category: ${category}). 
Include only its primary use and a very brief dosage note (if needed). 
**Maximum 30 words.** Do not use any introductory phrases.`;
        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "meta-llama/llama-4-scout-17b-16e-instruct",
                messages: [
                    {
                        role: "system",
                        content: "You are a concise medical assistant. Always reply with only the description text, no extra words.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                temperature: 0.3, // lower = more focused
                max_tokens: 60, // limits length
            }),
        });
        if (!response.ok) {
            const error = await response.text();
            console.error("Groq API error:", error);
            return server_1.NextResponse.json({ error: "Failed to generate description" }, { status: 500 });
        }
        const data = await response.json();
        let description = data.choices[0]?.message?.content?.trim() || "";
        // Optional: remove any accidental lead‑in
        description = description.replace(/^(Here('s| is) .*?:\s*)/i, '').trim();
        return server_1.NextResponse.json({ description });
    }
    catch (error) {
        console.error("Generate description error:", error);
        return server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
