import type { Message } from '@/lib/types';
import { MessageBubble } from './MessageBubble';
import { LoadingIndicator } from './LoadingIndicator';
import { ErrorMessage } from './ErrorMessage';
import { EmptyState } from './EmptyState';

interface MessageAreaProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export function MessageArea({
  messages,
  isLoading,
  error,
}: MessageAreaProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
      <div className="max-w-4xl mx-auto flex flex-col gap-4 md:gap-6">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {messages.map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}
            <LoadingIndicator isLoading={isLoading} />
            <ErrorMessage error={error} />
          </>
        )}
      </div>
    </div>
  );
}
