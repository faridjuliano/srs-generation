import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Generate standard-specific prompt
function generatePrompt(
  projectName: string,
  srsStandard: string,
  projectVision: string
): string {
  const standardInfo = srsStandard === 'ISO/IEC/IEEE 29148:2018'
    ? `ISO/IEC/IEEE 29148:2018 (International standard for systems and software engineering - Life cycle processes - Requirements engineering)`
    : `IEEE 830-1998 (IEEE Standard for Software Requirements Specifications)`;

  return `Generate a comprehensive Software Requirements Specification (SRS) document following the ${standardInfo} standard based on the following information:

Project Name: ${projectName}
SRS Standard: ${srsStandard}

Project Description & Requirements:
${projectVision}

Please provide the SRS in the following JSON structure:
{
  "title": "Software Requirements Specification - ${projectName}",
  "introduction": {
    "purpose": "Detailed purpose statement explaining what the software will do and why it's needed",
    "references": ["Reference 1", "Reference 2", "Reference 3"]
  },
  "overallDescription": {
    "userClassesAndCharacteristics": ["User class 1 description", "User class 2 description"],
    "operatingEnvironment": "Description of the operating environment and hardware/software platforms",
    "designAndImplementationConstraints": ["Constraint 1", "Constraint 2"],
    "assumptionsAndDependencies": ["Assumption 1", "Assumption 2"]
  },
  "externalInterfaceRequirements": {
    "userInterfaces": "Description of user interface design and standards",
    "hardwareInterfaces": "Description of hardware interfaces and communication protocols",
    "softwareInterfaces": ["Software interface 1", "Software interface 2"],
    "communicationInterfaces": "Description of communication interfaces and protocols"
  },
  "systemUseCases": [
    {
      "name": "Use case name",
      "identifier": "UC-001",
      "description": "Brief description of what the use case accomplishes",
      "actors": ["Actor 1", "Actor 2"],
      "preconditions": "Conditions that must be true before the use case starts",
      "mainFlow": ["Step 1", "Step 2", "Step 3"],
      "alternativeFlow": ["Alternative flow description"]
    }
  ],
  "functionalRequirements": [
    {
      "id": "FR-001",
      "title": "Requirement title",
      "description": "Detailed requirement description",
      "priority": "High"
    }
  ],
  "nonFunctionalRequirements": [
    {
      "id": "NFR-001",
      "category": "Performance",
      "description": "Non-functional requirement description",
      "priority": "High"
    }
  ],
  "otherNonfunctionalRequirements": {
    "performanceRequirements": ["Performance requirement 1", "Performance requirement 2"],
    "safetyRequirements": ["Safety requirement 1"],
    "securityRequirements": ["Security requirement 1", "Security requirement 2"],
    "softwareQualityAttributes": ["Quality attribute 1", "Quality attribute 2"]
  },
  "otherRequirements": "Additional requirements including regulatory, compliance, or other specialized requirements",
  "systemRequirementsChart": "Summary of how the requirements map to system capabilities"
}

IMPORTANT GUIDELINES FOR ${srsStandard}:
${srsStandard === 'ISO/IEC/IEEE 29148:2018'
  ? `- Follow ISO/IEC/IEEE 29148:2018 structure which emphasizes stakeholder requirements, system requirements, and software requirements
- Include clear traceability between requirements
- Focus on both functional and non-functional aspects
- Ensure requirements are measurable and verifiable
- Include acceptance criteria where applicable
- Consider system and software lifecycle aspects`
  : `- Follow IEEE 830-1998 structure with clear sections for introduction, overall description, and specific requirements
- Include detailed use cases and actor identification
- Specify constraints and assumptions clearly
- Provide interface specifications for all external interactions
- Include quality attributes and performance specifications`}

CRITICAL INSTRUCTIONS:
- Ensure the response is VALID JSON only (no markdown, no code blocks, no extra text)
- All required fields must be present
- Arrays must contain at least 2 items each
- Use the exact field names specified above
- Do not include any text before or after the JSON`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectName, projectVision, srsStandard } = body;

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

    const prompt = generatePrompt(
      projectName,
      srsStandard,
      projectVision
    );

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
