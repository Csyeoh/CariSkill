const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testExploreAPI() {
    try {
        const genAI = new GoogleGenerativeAI('AIzaSyAcqHlzMb9mkSzVisvji1Z7f7p_yTR15ms');
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

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();
        fs.writeFileSync('node_out.txt', "RAW RESPONSE:\n" + responseText);

        responseText = responseText.replace(/```json\n?/g, '').replace(/```/g, '').trim();

        const parsedData = JSON.parse(responseText);
        let aiSuggestions = Array.isArray(parsedData) ? parsedData : (parsedData.suggestions || Object.values(parsedData)[0]);
        if (!Array.isArray(aiSuggestions)) aiSuggestions = [];

        fs.appendFileSync('node_out.txt', "\n\nPARSED:\n" + JSON.stringify(aiSuggestions));
    } catch (error) {
        fs.writeFileSync('node_out.txt', "ERROR CATCH:\n" + error.message + "\n" + error.stack);
    }
}

testExploreAPI();
