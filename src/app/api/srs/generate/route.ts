import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectName, projectVision, srsStandard, toneDetail, outputLanguage, autoDetectActors } = body;

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
        // Ask Gemini to return strict JSON to avoid parse errors
        responseMimeType: 'application/json',
      },
    });

    const prompt = `Generate a comprehensive Software Requirements Specification (SRS) document in IEEE 830-1998 format based on the following information:

Project Name: ${projectName}
SRS Standard: ${srsStandard}
Tone & Detail: ${toneDetail}
Output Language: ${outputLanguage}
Auto-detect Actors: ${autoDetectActors}

Project Description & Requirements:
${projectVision}

Please provide the SRS in the following JSON structure (IEEE 830-1998 format):
{
  "title": "Software Requirements Specification - ${projectName}",
  "introduction": {
    "purpose": "Detailed purpose statement",
    "references": ["Reference 1", "Reference 2", "Reference 3"]
  },
  "overallDescription": {
    "userClassesAndCharacteristics": ["User class 1 description", "User class 2 description"],
    "operatingEnvironment": "Description of operating environment",
    "designAndImplementationConstraints": ["Constraint 1", "Constraint 2"],
    "assumptionsAndDependencies": ["Assumption 1", "Assumption 2"]
  },
  "externalInterfaceRequirements": {
    "userInterfaces": "UI description",
    "hardwareInterfaces": "Hardware description",
    "softwareInterfaces": ["Interface 1", "Interface 2"],
    "communicationInterfaces": "Communication protocols"
  },
  "systemUseCases": [
    {
      "name": "Use case name",
      "identifier": "UC-001",
      "description": "Brief description",
      "actors": ["Actor 1"],
      "preconditions": "Precondition",
      "mainFlow": ["Step 1", "Step 2"],
      "alternativeFlow": ["Alternative 1"]
    }
  ],
  "otherNonfunctionalRequirements": {
    "performanceRequirements": ["Performance requirement 1"],
    "safetyRequirements": ["Safety requirement 1"],
    "securityRequirements": ["Security requirement 1"],
    "softwareQualityAttributes": ["Quality attribute 1"]
  },
  "otherRequirements": "Additional requirements text",
  "systemRequirementsChart": "Description of requirements chart"
}

IMPORTANT: 
- Ensure the response is VALID JSON only
- No markdown formatting
- No code blocks
- No additional text before or after the JSON
- All required fields must be present
- Arrays must contain at least 2 items
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Fallback: some Gemini responses may leave text() empty but include candidates
    if (!text || text.trim().length === 0) {
      const fallback = response.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text)
        .filter(Boolean)
        .join('');
      if (fallback && fallback.trim().length > 0) {
        text = fallback;
      }
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from API');
    }

    const cleanedText = cleanApiText(text);
    const content = safeParseJson(cleanedText);

    // Validate required fields
    if (!content.title || !content.introduction || !content.overallDescription) {
      throw new Error('Missing required SRS sections in response');
    }

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error('Error generating SRS:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate SRS document';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// Lightly sanitize the model response before parsing
function cleanApiText(raw: string): string {
  // Trim and drop code fences
  let cleaned = raw.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');

  // Extract the JSON portion between the first '{' and last '}'
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Response is not valid JSON format');
  }
  cleaned = cleaned.slice(start, end + 1);

  // Remove trailing commas before object/array terminators
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

  // Quote unquoted property names (best-effort; skips already-quoted keys)
  cleaned = cleaned.replace(/([,{]\s*)([A-Za-z0-9_]+)\s*:/g, (match, prefix, key) => {
    if (key.startsWith('"')) return match; // already quoted
    return `${prefix}"${key}":`;
  });

  return cleaned.trim();
}

function safeParseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Primary JSON parse failed; cleaned text:', text);
    throw err instanceof Error ? err : new Error('Failed to parse JSON');
  }
}
