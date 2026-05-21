// Server-side console suppression helper
// Call this early in server execution to disable console.log in production.

export function suppressConsoleInProductionServer(): void {
  try {
    if (process.env.NODE_ENV === 'production') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (console as any).log = () => {};
    }
  } catch (e) {
    // If anything goes wrong, don't crash the app
  }
}

