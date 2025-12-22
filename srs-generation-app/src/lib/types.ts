export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  role: Role;
  content: string;
}

export interface ChatRequestBody {
  messages: Message[];
  // Optional metadata can be added later
}

export interface ChatResponseBody {
  ok: boolean;
  message?: Message;
  error?: string;
}
