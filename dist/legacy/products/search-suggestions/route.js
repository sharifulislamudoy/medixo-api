"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const fuse_js_1 = __importDefault(require("fuse.js"));
const prisma_1 = require("../../../lib/prisma");
async function POST(req) {
    try {
        const { query } = await req.json();
        if (!query || query.trim().length < 2) {
            return server_1.NextResponse.json({ products: [] });
        }
        const trimmedQuery = query.trim();
        // ---------- Try AI query expansion first ----------
        let suggestions = [];
        try {
            const prompt = `You are a product search assistant. The user is searching for a product by name or SKU. The input may contain spelling mistakes. Based on the input, generate up to 5 possible correct spellings, phonetic alternatives, or similar product names. Return a JSON array of strings.
Example: user input "paracitamol" -> ["paracetamol", "paracetomol", "paracet"]
User input: "${trimmedQuery}"
Return only the JSON array, nothing else.`;
            if (!process.env.GROQ_API_KEY)
                throw new Error("AI search key not configured");
            const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.1-8b-instant",
                temperature: 0.2,
                max_tokens: 200,
            });
            const content = completion.choices[0]?.message?.content;
            if (content) {
                const match = content.match(/\[[\s\S]*?\]/);
                if (match) {
                    suggestions = JSON.parse(match[0]);
                }
            }
        }
        catch (err) {
            console.error("Groq query expansion failed:", err);
        }
        const searchTerms = [trimmedQuery, ...suggestions].filter(Boolean);
        const nameConditions = searchTerms.map((term) => ({
            name: { contains: term, mode: "insensitive" },
        }));
        const skuConditions = searchTerms.map((term) => ({
            sku: { contains: term, mode: "insensitive" },
        }));
        let products = await prisma_1.prisma.product.findMany({
            where: {
                status: true,
                OR: [...nameConditions, ...skuConditions],
            },
            select: {
                id: true,
                name: true,
                sku: true,
                mrp: true,
                costPrice: true,
                profitMargin: true,
                costMargin: true, // 👈 NEW
                sellPrice: true,
                stock: { select: { quantity: true } },
                nextPurchasePrice: true,
                image: true,
            },
            take: 20,
        });
        if (products.length === 0) {
            const allProducts = await prisma_1.prisma.product.findMany({
                where: { status: true },
                select: {
                    id: true,
                    name: true,
                },
            });
            const fuse = new fuse_js_1.default(allProducts, {
                keys: ["name"],
                threshold: 0.4,
                includeScore: true,
            });
            const fuseResults = fuse.search(trimmedQuery).slice(0, 5);
            const matchedIds = fuseResults.map(r => r.item.id);
            if (matchedIds.length > 0) {
                products = await prisma_1.prisma.product.findMany({
                    where: {
                        id: { in: matchedIds },
                        status: true,
                    },
                    select: {
                        id: true,
                        name: true,
                        sku: true,
                        mrp: true,
                        costPrice: true,
                        profitMargin: true,
                        costMargin: true, // 👈 NEW
                        sellPrice: true,
                        stock: { select: { quantity: true } },
                        nextPurchasePrice: true,
                        image: true,
                    },
                    take: 20,
                });
                const idToProduct = Object.fromEntries(products.map(p => [p.id, p]));
                products = matchedIds.map(id => idToProduct[id]).filter(Boolean);
            }
        }
        const mapped = products.map((p) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            mrp: p.mrp,
            costPrice: p.costPrice,
            profitMargin: p.profitMargin,
            costMargin: p.costMargin, // 👈 NEW
            sellPrice: p.sellPrice,
            stock: p.stock?.quantity ?? 0,
            nextPurchasePrice: p.nextPurchasePrice,
            image: p.image,
        }));
        return server_1.NextResponse.json({ products: mapped });
    }
    catch (error) {
        console.error("Search error:", error);
        return server_1.NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}
