import type { Metadata } from "next";
import XmlToToonClientPage from "@/components/xml-to-toon/page";

export const metadata: Metadata = {
    title: "XML to TOON Converter - Save Tokens",
    description:
        "Convert XML to TOON format directly in your browser. Reduce token usage for LLM prompts by converting verbose XML to compact TOON.",
};

export default function XmlToToonPage() {
    return <XmlToToonClientPage />;
}
