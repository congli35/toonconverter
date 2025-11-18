import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toonconverter.net";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "TOON Converter - Save Tokens with TOON",
  description:
    "Privacy-first toon converter that shrinks structured data into TOON format so LLM prompts use fewer tokens without losing structure.",
  keywords: [
    "toon converter",
    "TOON",
    "JSON converter",
    "LLM tooling",
    "token savings",
    "GPT",
    "data compression",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "TOON Converter - Save Tokens with TOON",
    description:
      "Use this in-browser toon converter to compress your data into TOON format and cut LLM token costs.",
    url: siteUrl,
    siteName: "TOON Converter",
    type: "website",
    images: [
      {
        url: `${siteUrl}/og.png`,
        width: 1200,
        height: 630,
        alt: "TOON Converter logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TOON Converter - Save Tokens with TOON",
    description:
      "Convert structured data to TOON instantly with this privacy-first toon converter to save tokens on every LLM call.",
    images: [`${siteUrl}/og.png`],
  },
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
