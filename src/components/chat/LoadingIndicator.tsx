interface LoadingIndicatorProps {
  isLoading: boolean;
}

export function LoadingIndicator({ isLoading }: LoadingIndicatorProps) {
  if (!isLoading) return null;

  return (
    <div className="flex justify-start">
      <div className="flex gap-4 max-w-xl">
        <div className="size-8 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-200 dark:bg-slate-700">
          🤖
        </div>
        <div className="rounded-xl px-4 py-3 bg-slate-100 dark:bg-[#202434]">
          <div className="flex gap-2">
            <div className="size-2 bg-slate-400 rounded-full animate-bounce"></div>
            <div
              className="size-2 bg-slate-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
            <div
              className="size-2 bg-slate-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.4s' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

