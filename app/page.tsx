// "use client" marks this as a client component for interactive conversion
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { HeuristicTokenizer } from "@/lib/tokenizer";
import { listConverters, getConverter } from "@/lib/converters/registry";
import type { ConverterId } from "@/lib/converters/types";
import type { JsonToToonOptions } from "@/lib/converters/json-to-toon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { safeParseJson } from "@/lib/utils";

type ConvertResult = {
  output: string;
  error?: string;
};

export default function Home() {
  // UI state
  const firstConverter = listConverters()[0];
  const [converterId, setConverterId] = useState<ConverterId>(
    (firstConverter?.id as ConverterId) ?? "json-to-toon"
  );
  const converter = useMemo(() => getConverter(converterId), [converterId]);
  const [input, setInput] = useState<string>(
    (converter?.defaultInput as string) ??
      '{"users":[{"id":1,"name":"Alice","role":"admin","active":true},{"id":2,"name":"Bob","role":"user","active":true},{"id":3,"name":"Charlie","role":"user","active":false}]}'
  );
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | undefined>();
  const [options, setOptions] = useState<JsonToToonOptions>({
    indent: 2,
    delimiter: ",",
    keyFolding: "off",
  });

  // Debounce conversion
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      (async () => {
        try {
          if (!converter) return;
          const result = await converter.convert(input, options);
          setOutput(result.output);
          setError(undefined);
        } catch (e: any) {
          setOutput("");
          setError(String(e?.message ?? e));
        }
      })();
    }, 250);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [input, options, converter]);

  const inputTokens = useMemo(() => HeuristicTokenizer.estimate(input), [input]);
  const outputTokens = useMemo(() => HeuristicTokenizer.estimate(output), [output]);
  const savings = inputTokens > 0 ? inputTokens - outputTokens : 0;
  const percent = inputTokens > 0 ? Math.round((savings / inputTokens) * 100) : 0;

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      // ignore
    }
  };

  const downloadOutput = () => {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.toon";
    a.click();
    URL.revokeObjectURL(url);
  };

  const prettifyInput = () => {
    const parsed = safeParseJson(input);
    if (!parsed.ok) {
      setError(parsed.message);
      return;
    }
    const formatted = JSON.stringify(parsed.value, null, 2);
    setInput(formatted);
    setError(undefined);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <header className="sticky top-0 z-10 w-full border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-zinc-900 dark:bg-zinc-100" />
            <span className="text-sm font-semibold tracking-wide">TOON Converter</span>
          </div>
          <nav className="text-xs">
            <Link href="/" className="hover:underline">
              JSON → TOON
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl grow px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">Converter</span>
          <Select
            value={converterId}
            onValueChange={(id: ConverterId) => {
              setConverterId(id);
              const next = getConverter(id);
              if (next?.defaultInput) setInput(String(next.defaultInput));
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select converter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json-to-toon">JSON → TOON</SelectItem>
              <SelectItem value="toon-to-json" disabled>
                TOON → JSON (coming soon)
              </SelectItem>
              <SelectItem value="xml-to-json" disabled>
                XML → JSON (coming soon)
              </SelectItem>
            </SelectContent>
          </Select>

          <span className="ml-2 text-sm font-medium">Settings</span>
          <Label className="ml-2">Indent</Label>
          <Select
            value={String(options.indent)}
            onValueChange={(v) => setOptions((o) => ({ ...o, indent: Number(v) }))}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
            </SelectContent>
          </Select>

          <Label className="ml-2">Delimiter</Label>
          <Select
            value={options.delimiter}
            onValueChange={(v) => setOptions((o) => ({ ...o, delimiter: v as JsonToToonOptions["delimiter"] }))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=",">Comma</SelectItem>
              <SelectItem value="\t">Tab</SelectItem>
              <SelectItem value="|">Pipe</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto flex items-center gap-2"></div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Left: JSON input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>JSON Input</span>
                  <span className="text-xs font-normal text-zinc-500">Editable</span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={prettifyInput} variant="secondary" size="sm">
                        Prettify JSON
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Format the left JSON input</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea className={error ? "ring-1 ring-red-500" : ""} value={input} onChange={setInput} height={320} />
              {error ? (
                <div className="mt-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
                  {error}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Right: TOON output */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>TOON Output</span>
                  <span className="text-xs font-normal text-zinc-500">Read-only</span>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={copyOutput} variant="secondary" size="sm">
                          Copy
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy output to clipboard</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={downloadOutput} variant="secondary" size="sm">
                          Download
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Download as .toon</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea className="min-h-[320px]" value={output} readOnly height={320} />
            </CardContent>
          </Card>
        </div>

        {/* Token stats */}
        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div>
              <span className="text-zinc-500">JSON tokens (est.): </span>
              <span className="font-medium">{inputTokens}</span>
            </div>
            <div>
              <span className="text-zinc-500">TOON tokens (est.): </span>
              <span className="font-medium">{outputTokens}</span>
            </div>
            <div>
              <span className="text-zinc-500">Saved: </span>
              <span className="font-medium">
                {savings >= 0 ? savings : 0} ({percent >= 0 ? `-${percent}%` : "0%"})
              </span>
            </div>
            <div className="text-xs text-zinc-500">
              Token counts are estimated (chars/4). Exact stats will be added when available in TOON.
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t border-zinc-200 py-4 text-center text-xs text-zinc-500 dark:border-zinc-800">
        Built for in-browser conversion. UI uses Tailwind; Radix/Shadcn components can be added on request.
      </footer>
    </div>
  );
}
