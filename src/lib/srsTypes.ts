/**
 * Centralized types for SRS results and editing
 */

export type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };
export type JsonPath = Array<string | number>;

export type BackendValidation = {
  passed: boolean;
  errorCount: number;
  warningCount: number;
  issues: Array<{
    code: string;
    message: string;
    path?: string;
    suggestion?: string;
  }>;
  qualityScore: number;
};

export type ApiSrsPayload = {
  success: boolean;
  content: JsonObject;
  diagrams?: JsonObject;
  validation?: BackendValidation;
};

export type LegacyStoredPayload = {
  generatedContent?: JsonObject;
  validation?: BackendValidation;
  validationResult?: BackendValidation;
};

