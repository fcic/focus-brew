import { type ReactNode } from "react";
import { type Metadata } from "next";
import { Nunito, Roboto_Slab } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import "./fonts.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-roboto-slab",
});

export const metadata: Metadata = {
  title: "FocusBrew | Productivity Workspace",
  description:
    "All-in-one digital workspace with todo lists, kanban boards, pomodoro timer, notes, ambient sounds, and more to boost your productivity.",
  keywords: [
    "productivity",
    "workspace",
    "todo app",
    "kanban",
    "pomodoro",
    "notes",
    "focus timer",
    "ambient sounds",
  ],
  authors: [{ name: "FocusBrew" }],
  creator: "FocusBrew",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "FocusBrew | Productivity Workspace",
    description:
      "All-in-one digital workspace with todo lists, kanban boards, pomodoro timer, notes, ambient sounds, and more to boost your productivity.",
    siteName: "FocusBrew",
    images: [{ url: "/icon.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FocusBrew | Productivity Workspace",
    description:
      "All-in-one digital workspace with todo lists, kanban boards, pomodoro timer, notes, ambient sounds, and more to boost your productivity.",
    images: [{ url: "/icon.png" }],
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${nunito.variable} ${robotoSlab.variable} font-satoshi antialiased`}
      >
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
