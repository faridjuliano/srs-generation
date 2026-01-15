// ...existing code...
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const generateSRS = async (projectDescription: string) => {
  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8000,
      },
    });

    const prompt = `Generate a comprehensive Software Requirements Specification (SRS) document based on the following project description:

${projectDescription}

Please provide the SRS in the following JSON structure:
{
  "title": "Project Title",
  "introduction": {
    "purpose": "...",
    "scope": "...",
    "definitions": ["..."]
  },
  "overallDescription": {
    "productPerspective": "...",
    "productFunctions": ["..."],
    "userCharacteristics": ["..."],
    "constraints": ["..."],
    "assumptions": ["..."]
  },
  "functionalRequirements": [
    {
      "id": "FR-1",
      "title": "...",
      "description": "...",
      "priority": "High/Medium/Low"
    }
  ],
  "nonFunctionalRequirements": [
    {
      "id": "NFR-1",
      "category": "Performance/Security/Usability/etc",
      "description": "...",
      "priority": "High/Medium/Low"
    }
  ]
}

Ensure the response is valid JSON only, without any markdown formatting or additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up markdown code blocks if present
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating SRS:", error);
    throw new Error("Failed to generate SRS document");
  }
};

