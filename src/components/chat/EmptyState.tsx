interface EmptyStateProps {
  provider: 'openai' | 'gemini';
}

export function EmptyState({ provider }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <span className="text-4xl">💬</span>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Start a Conversation</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md">
        Ask me anything. I&apos;m powered by {provider === 'openai' ? 'OpenAI GPT' : 'Google Gemini'} with
        built-in safeguards and verification layers.
      </p>
    </div>
  );
}

