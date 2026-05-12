import type { FrNfrAutoFixSuggestion, FrNfrValidation } from '@/lib/frNfrTypes';

export type NfNfrDetailedFeature = {
  name: string;
  description: string;
};

export type NfNfrDetailedPrediction = {
  id?: string;
  statement?: string;
  confidence?: number;
  smell_boolean?: number | boolean;
};

export type NfNfrDetailedGenerateResponse = {
  success: boolean;
  content?: Record<string, unknown>;
  validation?: FrNfrValidation;
  autoFixSuggestions?: FrNfrAutoFixSuggestion[];
  prediction?: NfNfrDetailedPrediction[];
  error?: string;
  userId: string;
  projectId: string;
};

export type NfNfrDetailedStoredPayload = {
  success: boolean;
  content?: Record<string, unknown>;
  validation?: FrNfrValidation;
  autoFixSuggestions?: FrNfrAutoFixSuggestion[];
  prediction?: NfNfrDetailedPrediction[];
};

export type NfNfrDetailedGenerateRequest = {
  userId: string;
  projectId: string;
  project_name: string;
  project_description: string;
  features: NfNfrDetailedFeature[];
  constraints: string[];
  assumptions: string[];
};


