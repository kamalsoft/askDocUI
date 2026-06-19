import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/shared/app-shell";
import { ThemeProvider } from "@/context/ThemeContext";
import { Providers } from "@/components/shared/providers";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "askDocs | Local RAG Engine",
  description: "Advanced Document Intelligence Interface",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body 
        className={`${inter.className} h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <Providers>
            <Toaster position="top-right" richColors />
            <AppShell>
              {children}
            </AppShell>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}