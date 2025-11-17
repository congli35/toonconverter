import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TOON Converter - JSON to TOON Format Converter",
  description: "Convert JSON to TOON format instantly in your browser. Reduce token count for LLM prompts while maintaining data structure. Fast, private, and completely client-side.",
  keywords: ["TOON", "JSON", "converter", "LLM", "tokens", "GPT", "data compression"],
  icons: {
    icon: ["/icon.svg"],
    shortcut: ["/icon.svg"],
    apple: ["/icon.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
       <GoogleAnalytics gaId="G-TN113P6GK6" />
    </html>
  );
}
