import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { suppressConsoleInProductionServer } from '@/lib/suppressConsole';
import SuppressConsoleClient from '@/components/shared/SuppressConsoleClient';

const manrope = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SRS Generation & AI Chat",
  description: "AI-powered SRS generation with chatbot capabilities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Suppress server-side console.log in production
  suppressConsoleInProductionServer();
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} font-display antialiased`}
      >
        {/* Client-side suppression component (no UI) */}
        <SuppressConsoleClient />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        {children}
      </body>
    </html>
  );
}
