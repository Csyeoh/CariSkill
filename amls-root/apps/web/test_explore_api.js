require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testExploreAPI() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
      The user is a University Student / Intermediate in Software Engineering & Full-Stack Development. 
      They are currently learning or using: Angular, Firebase, React.js, Node.js, Oracle APEX, SQL.
      
      Suggest exactly 5 to 7 related but distinct skills, tools, or concepts they should explore next to level up their career. 
      Determine the importance of each (size: 'sm', 'md', or 'lg').
      
      CRITICAL RULE: Keep the skill name EXTREMELY concise (maximum 1 to 3 words). 
      For example, use "CI/CD" instead of "CI/CD (e.g., GitHub Actions)", or "REST APIs" instead of "RESTful API Design Principles".
      
      Return ONLY a JSON array of objects with this structure:
      [
        { "text": "Skill Name", "size": "md" }
      ]
    `;

        console.log("Generating content...");
        const result = await model.generateContent(prompt);
        let responseText = result.response.text();
        console.log("Raw response:", responseText);

        responseText = responseText.replace(/```json\n?/g, '').replace(/```/g, '').trim();

        const parsedData = JSON.parse(responseText);
        let aiSuggestions = Array.isArray(parsedData) ? parsedData : (parsedData.suggestions || Object.values(parsedData)[0]);
        if (!Array.isArray(aiSuggestions)) aiSuggestions = [];

        console.log("Parsed suggestions:", aiSuggestions);
    } catch (error) {
        console.error("API Error block executing:");
        console.error(error);
    }
}

testExploreAPI();
