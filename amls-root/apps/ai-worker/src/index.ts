import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'ai-worker' });
});

// AI Generation Endpoint
app.post('/api/generate-roadmap', async (req, res) => {
  try {
    const { topic, experience, requirements } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    console.log(`Generating roadmap for: ${topic} | Exp: ${experience} | Req: ${requirements}`);

    const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-pro", "gemini-1.5-flash"];
    let result;
    let lastError;

    const prompt = `
      You are an expert career counselor and senior developer. The user wants to learn exactly this: "${topic}".
      Their current experience level is: "${experience || 'Beginner'}".
      They have the following specific learning requirements and constraints: "${requirements || 'None'}".
      
      Provide a highly personalized, detailed, 4-phase learning roadmap. 
      For each phase, provide:
      - title: The name of the phase
      - duration: The estimated time (e.g. "2-4 weeks")
      - obj: The objective of the phase
      - items: An array of exactly 3 to 4 specific, actionable learning items/topics.
      
      Return ONLY a pure, strictly valid JSON object with NO trailing commas, and NO markdown formatting (do not wrap in \`\`\`json). Use this exact structure:
      {
        "description": "A short, motivating 2 sentence introduction to this roadmap.",
        "phases": [
          {
            "title": "Phase 1: ...",
            "duration": "...",
            "obj": "...",
            "items": ["item 1", "item 2", "item 3"]
          }
        ]
      }
    `;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[Attempt] Generating with ${modelName}...`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: "application/json" }
        });

        result = await model.generateContent(prompt);
        console.log(`[Success] Generated with ${modelName}`);
        break; // Success! Exit the loop
      } catch (e: any) {
        console.warn(`[Failed] Model ${modelName} returned error:`, e.message);
        lastError = e;
      }
    }

    if (!result) {
      throw lastError || new Error("All Gemini models are currently overloaded.");
    }

    let text = result.response.text();

    // Safely remove any accidental markdown wrapping if the LLM ignores instructions
    text = text.replace(/```(?:json)?\n?/gi, '').replace(/```/g, '').trim();

    // Sometimes the LLM includes trailing commas which breaks JSON.parse
    text = text.replace(/,\s*([\]}])/g, '$1');

    const parsedData = JSON.parse(text);

    return res.status(200).json({ status: "success", roadmap: parsedData });

  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return res.status(500).json({ status: "error", error: "Failed to generate roadmap", message: error.message });
  }
});

// Start server
app.listen(port as number, '0.0.0.0', () => {
  console.log(`AI Worker listening on port ${port}`);
});
