import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@stsgs/ui";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "3A Studio",
  description: "Artificial. Agentic. Architecture. - IDE for visual multi-agent systems",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="dark">
          <LanguageProvider>
            {children}
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
