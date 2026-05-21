"use client";

import { useEffect } from 'react';

export default function SuppressConsoleClient() {
  useEffect(() => {
    try {
      if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window.console as any).log = () => {};
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return null;
}

