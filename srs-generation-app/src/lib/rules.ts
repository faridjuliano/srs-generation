import { Message } from '@/lib/types';

// applyRules: enforce additional rules or transform user input/messages before sending to the model
export function applyRules(input: string, messages: Message[]): {
  input: string;
  messages: Message[];
  violations: string[];
} {
  const violations: string[] = [];

  // Normalize and trim input
  let sanitizedInput = (input ?? '').toString().trim();

  // Rule: limit max input length
  const MAX_INPUT_CHARS = 4000;
  if (sanitizedInput.length > MAX_INPUT_CHARS) {
    violations.push(`Input truncated to ${MAX_INPUT_CHARS} characters.`);
    sanitizedInput = sanitizedInput.slice(0, MAX_INPUT_CHARS);
  }

  // Rule: basic secret-like pattern detection (does not block, only flags)
  const secretPattern = /(api[_-]?key|password|token|secret|bearer\s+[a-z0-9\-_.]+)/i;
  if (secretPattern.test(sanitizedInput)) {
    violations.push('Potential secret detected in input. Review before proceeding.');
  }

  // Future rules can adjust the messages array (e.g., strip system prompts from user, etc.)
  return { input: sanitizedInput, messages, violations };
}

// verifyResponse: post-generation validation to flag or adjust responses
export function verifyResponse(responseText: string): {
  response: string;
  warnings: string[];
  isAllowable: boolean;
} {
  const warnings: string[] = [];
  let response = (responseText ?? '').toString();
  const isAllowable = true;

  // Post-check: extremely long responses
  const MAX_RESPONSE_CHARS = 10000;
  if (response.length > MAX_RESPONSE_CHARS) {
    warnings.push('Response too long, truncated.');
    response = response.slice(0, MAX_RESPONSE_CHARS);
  }

  // Post-check: basic profanity filter (warning only)
  const profanityPattern = /(\bshit\b|\bfuck\b|\bbitch\b)/i;
  if (profanityPattern.test(response)) {
    warnings.push('Profanity detected in response.');
  }

  // Example: if response contains obviously disallowed content you can block it entirely
  // Keep simple for now; allow by default and rely on upstream model safety + above checks

  return { response, warnings, isAllowable };
}
