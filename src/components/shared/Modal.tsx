import React from 'react';

type ModalProps = {
  isOpen: boolean;
  title?: string;
  message?: string;
  children?: React.ReactNode;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  onClose?: () => void;
};

export default function Modal({
  isOpen,
  title,
  message,
  children,
  primaryLabel = 'OK',
  secondaryLabel,
  onPrimary,
  onSecondary,
  onClose
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-4">
        <div className="bg-white dark:bg-[#0f1724] rounded-lg shadow-xl overflow-hidden">
          <div className="p-6">
            {title && <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>}
            {message && <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{message}</p>}
            {children}
          </div>
          <div className="flex justify-end gap-3 px-6 py-3 bg-slate-50 dark:bg-[#071124]">
            {secondaryLabel && (
              <button
                type="button"
                onClick={onSecondary}
                className="px-4 py-2 rounded-lg bg-transparent text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                {secondaryLabel}
              </button>
            )}
            <button
              type="button"
              onClick={onPrimary ?? onClose}
              className="px-4 py-2 rounded-lg bg-primary text-white"
            >
              {primaryLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

