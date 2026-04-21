export type FrNfrValidationIssue = {
  severity: 'error' | 'warning' | 'info';
  code?: string;
  requirementId?: string;
  requirementType?: string;
  category?: string;
  field?: string;
  details?: unknown;
  message: string;
  path?: string;
  suggestion?: string;
  raw?: Record<string, unknown>;
};

export type FrNfrValidation = {
  isValid: boolean;
  qualityScore: number | null;
  totalRequirements: number | null;
  totalIssues: number;
  errors: number;
  warnings: number;
  issues: FrNfrValidationIssue[];
};

export type FrNfrAutoFixSuggestion = {
  requirementId?: string;
  requirementType?: 'FR' | 'NFR' | string;
  category?: string;
  message: string;
  suggestion: string;
};

export type FrNfrStoredPayload = {
  success: boolean;
  content?: Record<string, unknown>;
  validation?: FrNfrValidation;
  autoFixSuggestions?: FrNfrAutoFixSuggestion[];
};

export type FrNfrGenerateResponse = {
  success: boolean;
  content?: Record<string, unknown>;
  validation?: FrNfrValidation;
  autoFixSuggestions?: FrNfrAutoFixSuggestion[];
  error?: string;
};

