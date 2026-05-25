import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalSidebar } from "@/components/shared/global-sidebar";
import { Navbar } from "@/components/shared/navbar";
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
        className={`${inter.className} h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`}
        suppressHydrationWarning
      >
        <Providers>
          <Toaster position="top-right" richColors />
          <div className="flex h-screen overflow-hidden">
            <GlobalSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <Navbar />
              <main className="flex-1 overflow-y-auto overflow-x-hidden">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}