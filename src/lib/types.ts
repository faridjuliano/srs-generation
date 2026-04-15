export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  role: Role;
  content: string;
}

export interface ChatRequestBody {
  messages?: Message[];
  // Optional single message (new validation path)
  message?: string;
  // Optional message history for retrieval context
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  // Optional metadata can be added later
  useRag?: boolean;
  topK?: number;
  // Re-prompt contract
  content?: Record<string, unknown>;
  instruction?: string;
  formData?: Record<string, unknown>;
}

export interface ChatResponseBody {
  ok: boolean;
  message?: Message;
  error?: string;
  // Retrieved snippets appended for PURE search results
  retrieved?: Array<{ id: string; score?: number; text: string; source?: string; meta?: unknown }>;
  // Updated SRS content from regeneration
  updatedSRS?: Record<string, unknown>;
  content?: Record<string, unknown>;
  updatedContent?: Record<string, unknown>;
  fixedContent?: Record<string, unknown>;
}
