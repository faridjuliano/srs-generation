import type { FrNfrAutoFixSuggestion, FrNfrValidation } from '@/lib/frNfrTypes';

export type NfNfrDetailedFeature = {
  name: string;
  description: string;
};

export type NfNfrDetailedGenerateResponse = {
  success: boolean;
  content?: Record<string, unknown>;
  validation?: FrNfrValidation;
  autoFixSuggestions?: FrNfrAutoFixSuggestion[];
  error?: string;
};

export type NfNfrDetailedStoredPayload = {
  success: boolean;
  content?: Record<string, unknown>;
  validation?: FrNfrValidation;
  autoFixSuggestions?: FrNfrAutoFixSuggestion[];
};

export type NfNfrDetailedGenerateRequest = {
  project_name: string;
  project_description: string;
  features: NfNfrDetailedFeature[];
  constraints: string[];
  assumptions: string[];
};


