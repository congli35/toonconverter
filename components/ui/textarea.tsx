"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { loader } from "@monaco-editor/react";
import { cn } from "@/lib/utils";

// Point monaco to the locally served assets to avoid CDN fetches.
loader.config({ paths: { vs: "/monaco/vs" } });

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export interface TextareaProps {
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  language?: string;
  height?: string | number;
  className?: string;
}

const Textarea = React.forwardRef<HTMLDivElement, TextareaProps>(
  ({ value, onChange, readOnly, language = "json", height = 320, className }, _ref) => {
    const [theme, setTheme] = React.useState<"vs" | "vs-dark">("vs");

    React.useEffect(() => {
      // Detect dark mode from the document
      const detectTheme = () => {
        const isDark = document.documentElement.classList.contains("dark");
        setTheme(isDark ? "vs-dark" : "vs");
      };

      // Initial detection
      detectTheme();

      // Watch for theme changes
      const observer = new MutationObserver(detectTheme);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      return () => observer.disconnect();
    }, []);

    return (
      <div className={cn("overflow-hidden rounded-lg border border-zinc-300 shadow-sm dark:border-zinc-700", className)}>
        <MonacoEditor
          height={height}
          language={language}
          value={value}
          onChange={(val) => onChange?.(val ?? "")}
          options={{
            minimap: { enabled: false },
            lineNumbers: "on",
            readOnly: Boolean(readOnly),
            fontSize: 14,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace",
            wordWrap: "on",
            scrollBeyondLastLine: false,
            renderLineHighlight: "line",
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
          }}
          theme={theme}
        />
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
