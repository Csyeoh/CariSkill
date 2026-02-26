import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"];

interface MessageRecord {
    role: 'user' | 'ai';
    content: string;
}

export async function POST(req: Request) {
    try {
        const { session_id, message, history = [] } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // Only use last 10 messages to avoid token limits
        const recentHistory = (history as MessageRecord[]).slice(-10);
        const conversationHistory = recentHistory
            .map(m => `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.content.substring(0, 300)}`)
            .join('\n');

        const userMessageCount = (history as MessageRecord[]).filter(m => m.role === 'user').length;

        const systemPrompt = `You are a friendly AI learning assistant. Your job is to figure out what personalised learning roadmap to build for the student. You MUST respond in a specific JSON format.

## RULES:
1. NEVER re-ask something already answered. Check the conversation history carefully.
2. Be proactive. If the student doesn't know what to do, SUGGEST options for them.
3. After at most 2 exchanges, COMMIT to generating a roadmap. Don't keep asking questions.
4. If the student says "you decide" or "I have no idea", immediately decide for them and set ready_to_generate to true.
5. Use **bold** and bullet points in your replies to make them easy to read.

## CONVERSATION HISTORY (${userMessageCount} student messages so far):
${conversationHistory || 'No history yet.'}

## STUDENT JUST SAID:
"${message}"

## RESPONSE FORMAT:
You MUST respond with ONLY this JSON object (no other text around it):
{
  "reply": "Your friendly message to the student here. Use **bold**, bullet lists, etc. Be warm and brief.",
  "ready_to_generate": false,
  "topic": ""
}

If you have enough info (or the student says you decide), set:
- "ready_to_generate": true
- "topic": "the specific topic/skill name to generate the roadmap for" (e.g. "PyTorch for Machine Learning Beginners")
- "reply": "A brief exciting message like: 'Perfect! I have everything I need. Generating your personalised roadmap now! 🚀'"

${userMessageCount >= 2 ? '⚠️ IMPORTANT: You MUST set ready_to_generate to true now. You have enough info. Commit!' : ''}

Respond ONLY with the JSON. No extra explanation outside the JSON.`;

        let lastError: any;
        for (const modelName of MODELS) {
            try {
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    generationConfig: { responseMimeType: "application/json" }
                });
                const result = await model.generateContent(systemPrompt);
                let text = result.response.text().trim();

                // Strip any markdown code fences if present
                text = text.replace(/```json\n?/gi, '').replace(/```/g, '').trim();

                const parsed = JSON.parse(text);
                return NextResponse.json({
                    response: {
                        reply: parsed.reply || "Let me help you with that!",
                        ready_to_generate: parsed.ready_to_generate || false,
                        topic: parsed.topic || ""
                    }
                });
            } catch (e: any) {
                console.warn(`[Chat API] Model ${modelName} failed: ${e.message}`);
                lastError = e;
            }
        }

        throw lastError;

    } catch (error: any) {
        console.error("[Chat API] All models failed:", error?.message);
        return NextResponse.json(
            { status: "error", message: error.message },
            { status: 500 }
        );
    }
}
