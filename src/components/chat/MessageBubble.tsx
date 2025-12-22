import type { Message } from '@/lib/types';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-4 max-w-xl ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
        <div
          className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            message.role === 'user'
              ? 'bg-primary text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
          }`}
        >
          {message.role === 'user' ? '👤' : '🤖'}
        </div>
        <div
          className={`rounded-xl px-4 py-3 ${
            message.role === 'user'
              ? 'bg-primary text-white'
              : 'bg-slate-100 dark:bg-[#202434] text-slate-900 dark:text-white'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  );
}

