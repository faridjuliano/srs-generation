interface ErrorMessageProps {
  error: string | null;
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;

  return (
    <div className="flex justify-center">
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg px-4 py-3 max-w-xl">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    </div>
  );
}

