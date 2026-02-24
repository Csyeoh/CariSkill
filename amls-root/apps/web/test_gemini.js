require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyAcqHlzMb9mkSzVisvji1Z7f7p_yTR15ms');
async function run() {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent('Say Hi');
        console.log("SUCCESS:", result.response.text());
    } catch (e) {
        console.error("API ERROR DETECTED:", e.message);
    }
}
run();
