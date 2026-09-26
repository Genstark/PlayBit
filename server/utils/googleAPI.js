const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Load your API key securely
const genAI = new GoogleGenerativeAI(process.env.GEMINI);

async function generateText() {
    console.log('Generating Tasks please wait...');
    const prompt_data = `You are an enthusiastic, fun, and engaging teacher who loves turning learning into an interactive game! 
    Your task is to generate a total of 10 engaging and age-appropriate multiple-choice science questions suitable for children ranging from 3 to 15 years old. 
    Group or scale the difficulty of the questions progressively across three age brackets: Toddlers/Preschoolers (ages 3-6), Elementary/Middle Kids (ages 7-11), 
    and Teens (ages 12-15).
    ### Output Format Requirements:
    - Return the output strictly as a single valid JSON object.
    - Do not include any markdown code block wrappers (like json) or extra conversational text outside the JSON.
    - Ensure the JSON follows this exact structure:
    {
        "questions": [
            {
                "type": "multiple_choice",
                "question": "Write the question here?",
                "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                "correctAnswer": 0
            }
        ]
    }

    ### Guidelines:
    1. Generate exactly 10 questions.
    2. Provide precisely 4 options for each question.
    3. The correctAnswer must be the zero-based numeric index (0, 1, 2, or 3) of the correct option in the options array, NOT a string.
    4. Scale the questions progressively from ages 3 to 15.`;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash", // Use "gemini-2.5-flash" if available to you
        });
        const result = await model.generateContent({
            contents: [{
                role: "user",
                parts: [
                    {
                        text: prompt_data
                    }
                ]
            }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        });
        console.log('Task Generated Successfully');
        return result.response.text();
    }
    catch (error) {
        console.error("Error generating text:", error);
        throw error;
    }
}
// generateText("generate most tough and tough questions scientific");

module.exports = { generateText };