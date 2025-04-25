import type React from "react";
import type { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { Roboto_Slab } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-roboto-slab",
});

export const metadata: Metadata = {
  title: "coffee with code",
  description: "A minimalist productivity app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${robotoSlab.variable} font-serif`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
