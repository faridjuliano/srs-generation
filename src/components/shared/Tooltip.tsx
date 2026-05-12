"use client";

import { type ReactNode, useState } from 'react';

type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export default function Tooltip({ content, children, className = '', contentClassName = '' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <span
          role="tooltip"
          className={`absolute left-1/2 top-full z-50 mt-2 w-80 max-w-sm -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm leading-6 text-slate-700 shadow-xl dark:border-slate-700 dark:bg-[#1a1d2d] dark:text-slate-200 ${contentClassName}`}
        >
          {content}
        </span>
      )}
    </span>
  );
}


