import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generatePrompt } from './promptBuilder';
import { validateSRS, type SRSDocument } from '@/lib/srsValidator';

// Prompt generation moved to ./promptBuilder for cleaner route.ts.
const HARD_CODED_PROMPT_SET: 'default' | 'iso-strict' = 'iso-strict';
const HARD_CODED_ENABLE_VALIDATION = true;

function extractModelText(response: {
  text: () => string;
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}): string {
  let text = response.text();

  if (!text || text.trim().length === 0) {
    const fallback = response.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text)
      .filter(Boolean)
      .join('');

    if (fallback && fallback.trim().length > 0) {
      text = fallback;
    }
  }

  return text || '';
}

function buildJsonRepairPrompt(invalidJson: string): string {
  return `You are a strict JSON repair tool.

TASK:
Repair the following content into VALID JSON.

RULES:
- Return JSON only.
- Do not add markdown, code fences, comments, or explanations.
- Preserve the original structure and values as much as possible.
- Fix syntax issues such as trailing commas, missing quotes, invalid escapes, or broken brackets.

CONTENT TO REPAIR:
${invalidJson}`;
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectName,
      projectVision,
      srsStandard,
      authorName,
      uploadedFiles
    } = body;

    const prompt = generatePrompt({
      projectName,
      srsStandard,
      projectVision,
      promptSet: HARD_CODED_PROMPT_SET,
      authorName: typeof authorName === 'string' && authorName.trim().length > 0 ? authorName : 'AI Generator',
      uploadedFiles: Array.isArray(uploadedFiles)
        ? uploadedFiles.filter((file): file is string => typeof file === 'string')
        : []
    });

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY environment variable is not set' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const geminiModel = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-pro-latest',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8000,
        // Ask Gemini to return strict JSON to avoid parse errors
        responseMimeType: 'application/json',
      },
    });

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = extractModelText(response as {
      text: () => string;
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    });

    console.log('=== GEMINI RAW RESPONSE TEXT ===');
    console.log(text);
    console.log('=== END GEMINI RAW RESPONSE TEXT ===');

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Empty response from API' },
        { status: 500 }
      );
    }

    let parsedDocument: unknown;
    try {
      parsedDocument = JSON.parse(text);
    } catch (firstParseError) {
      console.warn('Initial JSON parse failed, attempting one repair pass.');

      const repairPrompt = buildJsonRepairPrompt(text);
      const repairResult = await geminiModel.generateContent(repairPrompt);
      const repairResponse = await repairResult.response;
      const repairedText = extractModelText(repairResponse as {
        text: () => string;
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      });

      console.log('=== GEMINI REPAIRED RESPONSE TEXT ===');
      console.log(repairedText);
      console.log('=== END GEMINI REPAIRED RESPONSE TEXT ===');

      if (!repairedText || repairedText.trim().length === 0) {
        throw firstParseError;
      }

      parsedDocument = JSON.parse(repairedText);
    }

    if (!parsedDocument || typeof parsedDocument !== 'object' || Array.isArray(parsedDocument)) {
      return NextResponse.json(
        { success: false, error: 'Model returned JSON that is not an object.' },
        { status: 500 }
      );
    }

    // Log the returned JSON from Gemini for testing
    console.log('=== GEMINI RESPONSE JSON ===');
    console.log(JSON.stringify(parsedDocument, null, 2));
    console.log('=== END GEMINI RESPONSE ===');

    if (HARD_CODED_ENABLE_VALIDATION) {
      const validationResult = validateSRS(parsedDocument as SRSDocument);
      return NextResponse.json({
        success: true,
        content: parsedDocument,
        validation: validationResult,
        validationResult
      });
    }

    return NextResponse.json({ success: true, content: parsedDocument });
  } catch (error) {
    console.error('Error generating SRS:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate SRS document';
    return NextResponse.json(
      { success: false, error: errorMessage, code: 'SRS_GENERATION_JSON_PARSE_ERROR' },
      { status: 500 }
    );
  }
}
