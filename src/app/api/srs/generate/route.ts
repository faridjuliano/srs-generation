import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectName, projectVision, srsStandard, toneDetail, outputLanguage, autoDetectActors, uploadedFiles } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY environment variable is not set' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-pro-latest',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8000,
      },
    });

    const prompt = `Generate a comprehensive Software Requirements Specification (SRS) document based on the following information:

Project Name: ${projectName}
SRS Standard: ${srsStandard}
Tone & Detail: ${toneDetail}
Output Language: ${outputLanguage}
Auto-detect Actors: ${autoDetectActors}

Project Vision & Requirements:
${projectVision}

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
    const content = JSON.parse(cleanedText);

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error('Error generating SRS:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate SRS document' },
      { status: 500 }
    );
  }
}
