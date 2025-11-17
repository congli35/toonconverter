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
    return (
      <div className={cn("overflow-hidden rounded-md border border-zinc-300 dark:border-zinc-700", className)}>
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
          }}
          theme="vs"
        />
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
