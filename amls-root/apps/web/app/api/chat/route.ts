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
        const { session_id, message, history = [], roadmap_context, current_roadmap } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // Only use last 10 messages to avoid token limits
        const recentHistory = (history as MessageRecord[]).slice(-10);
        const conversationHistory = recentHistory
            .map(m => `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.content.substring(0, 300)}`)
            .join('\n');

        const userMessageCount = (history as MessageRecord[]).filter(m => m.role === 'user').length;

        let systemPrompt: string;

        if (roadmap_context) {
            // ─── ROADMAP Q&A + EDIT MODE ───
            // Used by FloatingChat — either answers questions OR edits the roadmap JSON
            const isEditRequest = /add|remove|delete|change|update|modify|include|insert|put|replace|rename|move|create|make it|reorder/i.test(message);
            const roadmapContext = current_roadmap ? JSON.stringify(current_roadmap).substring(0, 2000) : 'Not available';

            if (isEditRequest && current_roadmap) {
                systemPrompt = `You are an expert AI assistant editing a CariSkill learning roadmap. The student wants to modify their **${roadmap_context}** roadmap.

## CURRENT ROADMAP (JSON):
${roadmapContext}

## CONVERSATION HISTORY:
${conversationHistory || 'No previous messages.'}

## STUDENT REQUESTS:
"${message}"

## YOUR TASK:
Apply the student's requested changes to the roadmap JSON. Keep the same overall structure. Only change what was requested.

## RESPONSE FORMAT (JSON only, no extra text):
{
  "reply": "Done! I've updated your roadmap: [brief description of what changed]. The page will refresh in a moment.",
  "edit_roadmap": true,
  "updated_roadmap": { /* full updated roadmap JSON here matching the original structure */ }
}`;
            } else {
                systemPrompt = `You are a helpful AI tutor assistant for CariSkill. The student is viewing their **${roadmap_context}** learning roadmap.

Your role is to:
- Answer questions about concepts, topics, or resources in the **${roadmap_context}** roadmap
- Explain confusing concepts clearly and encouragingly
- Suggest tips, resources, or strategies for completing phases
- Help the student stay motivated

## CONVERSATION HISTORY:
${conversationHistory || 'No previous messages.'}

## STUDENT ASKS:
"${message}"

## RESPONSE FORMAT (JSON only, no extra text):
{
  "reply": "Your helpful, markdown-formatted response. Use **bold** for key terms, bullet lists for steps/resources.",
  "edit_roadmap": false,
  "updated_roadmap": null
}`;
            }
        } else {
            // ─── ROADMAP CREATION MODE ───
            // Used by /chat page — gathers requirements then signals ready to generate
            systemPrompt = `You are a friendly AI learning roadmap assistant. Your mission is to quickly understand what the student wants to learn and immediately start being helpful — not to endlessly interview them.

## CORE RULES — FOLLOW THESE STRICTLY:

1. **NEVER re-ask something already answered.** The full conversation history is given to you. Read it carefully before responding.

2. **Be opinionated and proactive.** If the student says they don't know something, MAKE HELPFUL SUGGESTIONS for them. Example: "Since you want to learn PyTorch, typical goals include: (A) deep learning research, (B) building neural networks, or (C) computer vision. I'd suggest starting with basics then deep learning. Want me to go with that?"

3. **Maximum 2 clarifying exchanges**, then COMMIT and generate a roadmap plan. If the student says "you do it for me" or "I have no idea", JUST TAKE CHARGE and provide a solid recommendation.

4. **After 2+ user messages, ALWAYS wrap up** with a brief learning plan outline instead of more questions.

5. **If the student says they're confused or don't know**, give them 2-3 labelled options (A, B, C) and suggest which is best for a beginner.

---

## CONVERSATION SO FAR:
${conversationHistory || 'No history yet.'}

---

## CURRENT SITUATION:
- Student has sent ${userMessageCount} message(s) in total.
- ${userMessageCount >= 2 ? '⚠️ You ALREADY have enough information. DO NOT ask more questions. Commit to a roadmap direction and set ready_to_generate to true.' : 'You may ask at most ONE more clarifying question.'}

## STUDENT SAYS NOW:
"${message}"

## RESPONSE FORMAT (JSON only, no extra text):
{
  "reply": "Your friendly message. Use **bold** and bullet points.",
  "ready_to_generate": false,
  "topic": ""
}

If ready: set "ready_to_generate": true, "topic": "short topic (max 5 words, no colon, no subtitle, no 'for Beginners' — e.g. 'Python for Data Science', 'React Frontend Development', 'Machine Learning Basics')", reply: "Perfect! Generating your personalised roadmap now! 🚀"`;
        }

        let lastError: any;
        for (const modelName of MODELS) {
            try {
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    generationConfig: { responseMimeType: "application/json" }
                });
                const result = await model.generateContent(systemPrompt);
                let text = result.response.text().trim();
                text = text.replace(/```json\n?/gi, '').replace(/```/g, '').trim();

                const parsed = JSON.parse(text);
                return NextResponse.json({
                    response: {
                        reply: parsed.reply || "I'm here to help!",
                        ready_to_generate: parsed.ready_to_generate || false,
                        topic: parsed.topic || "",
                        edit_roadmap: parsed.edit_roadmap || false,
                        updated_roadmap: parsed.updated_roadmap || null
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
