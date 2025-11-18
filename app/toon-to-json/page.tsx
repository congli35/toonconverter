import type { Metadata } from "next";
import ToonToJsonClientPage from "@/components/toon-to-json/page";

export const metadata: Metadata = {
  title: "TOON to JSON Converter - Decode TOON safely",
  description:
    "Convert TOON back to JSON directly in your browser. Paste any TOON snippet and decode it with strict validation and path expansion controls.",
};

export default function ToonToJsonPage() {
  return <ToonToJsonClientPage />;
}
