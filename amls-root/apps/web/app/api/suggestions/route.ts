import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Pre-defined scattered positions for the bubbles to prevent overlapping
const BUBBLE_POSITIONS = [
  { top: '20%', left: '20%', delay: 0 },
  { top: '45%', left: '80%', delay: 0.5 },
  { top: '75%', left: '30%', delay: 1 },
  { top: '50%', left: '50%', delay: 0.2 },
  { top: '80%', left: '70%', delay: 0.8 },
  { top: '25%', left: '75%', delay: 1.2 },
  { top: '15%', left: '50%', delay: 0.7 },
];

export async function POST(req: Request) {
  try {
    const { field, level, currentSkills } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      The user is a ${level} in ${field}. 
      They are currently learning or using: ${currentSkills.join(', ')}.
      
      Suggest exactly 5 to 7 related but distinct skills, tools, or concepts they should explore next to level up their career. 
      Determine the importance of each (size: 'sm', 'md', or 'lg').
      
      CRITICAL RULE: Keep the skill name EXTREMELY concise (maximum 1 to 3 words). 
      For example, use "CI/CD" instead of "CI/CD (e.g., GitHub Actions)", or "REST APIs" instead of "RESTful API Design Principles".
      
      Return ONLY a JSON array of objects with this structure:
      [
        { "text": "Skill Name", "size": "md" }
      ]
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    responseText = responseText.replace(/```json\n?/g, '').replace(/```/g, '').trim();

    const parsedData = JSON.parse(responseText);
    let aiSuggestions = Array.isArray(parsedData) ? parsedData : (parsedData.suggestions || Object.values(parsedData)[0]);
    if (!Array.isArray(aiSuggestions)) aiSuggestions = [];

    // Map the AI suggestions to our safe CSS positions
    const formattedBubbles = aiSuggestions.map((item: any, index: number) => ({
      id: `dyn-bubble-${index}`,
      text: item.text,
      size: item.size || 'md',
      top: BUBBLE_POSITIONS[index % BUBBLE_POSITIONS.length].top,
      left: BUBBLE_POSITIONS[index % BUBBLE_POSITIONS.length].left,
      delay: BUBBLE_POSITIONS[index % BUBBLE_POSITIONS.length].delay,
    }));

    return NextResponse.json(formattedBubbles);

  } catch (error: any) {
    console.error("Suggestions API Error:", error);
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 });
  }
}