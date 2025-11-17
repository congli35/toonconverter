// "use client" marks this as a client component for interactive conversion
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { GPTTokenizer } from "@/lib/tokenizer";
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

  const inputTokens = useMemo(() => GPTTokenizer.estimate(input), [input]);
  const outputTokens = useMemo(() => GPTTokenizer.estimate(output), [output]);
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
            <Image src="/icon.svg" alt="TOON converter logo" width={24} height={24} priority />
            <span className="text-sm font-semibold tracking-wide">TOON Converter</span>
          </div>
          <nav className="flex items-center gap-4 text-xs">
            <Link href="/" className="hover:underline">
              JSON to TOON
            </Link>
            <Link href="#faq" className="hover:underline">
              FAQ
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl grow px-4 py-6">
        <h1 className="mb-3 text-3xl font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
          Toon Converter: Everything to TOON, instantly in your browser
        </h1>
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200">
          All conversions run entirely in your browser—data never leaves this page.
        </div>
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
        <div className="mt-4 rounded-xl border border-zinc-200 bg-gradient-to-br from-white via-white to-zinc-50 p-4 text-sm shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">Token impact</p>
              <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                {savings > 0 ? `-${percent}% tokens` : "No savings yet"}
              </h3>
              <p className="text-xs text-zinc-500">
                Powered by{" "}
                <a href="https://github.com/niieani/gpt-tokenizer" target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                  gpt-tokenizer
                </a>{" "}
                (o200k_base · GPT-5 tokenizer)
              </p>
            </div>
            <div className="grid w-full gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-xs text-zinc-500">JSON tokens</p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{inputTokens}</p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-xs text-zinc-500">TOON tokens</p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{outputTokens}</p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950">
                <p className="text-xs uppercase tracking-wide">Saved</p>
                <p className="text-lg font-bold">
                  {savings >= 0 ? savings : 0}{" "}
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    ({percent >= 0 ? `-${percent}%` : "0%"})
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SEO-friendly FAQ */}
        <section id="faq" className="mt-8 space-y-4 rounded-2xl border border-zinc-200 bg-white/80 p-6 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-300">
              TOON Converter FAQ
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Everything you need to know about the TOON format
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              This toon converter keeps every transformation in the browser. Paste any JSON on the left editor
              and see a compressed, LLM-ready TOON representation instantly—no uploads, no waiting.
            </p>
          </div>
          <dl className="space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-gradient-to-r from-zinc-50 to-white p-4 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
              <dt className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                What exactly is the TOON format?
              </dt>
              <dd className="mt-1 text-zinc-600 dark:text-zinc-300">
                TOON (Token-Oriented Object Notation) is a compact, lossless representation of JSON that lists array lengths,
                flattens columns for uniform objects, and trims whitespace to reduce token counts for LLM prompts.
                Think of it as CSV&apos;s efficiency with JSON&apos;s structure, perfect for feeding structured data to GPT-5 and beyond—and this toon converter turns that theory into a copy-paste workflow.
              </dd>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-gradient-to-r from-zinc-50 to-white p-4 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
              <dt className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Why convert JSON to TOON with this tool?
              </dt>
              <dd className="mt-1 text-zinc-600 dark:text-zinc-300">
                The dual Monaco editors, live tokenizer, and delimiter controls make this toon converter ideal for exploring
                how much prompt budget you can save. You can verify schema fidelity instantly while our token stats quantify
                the improvements, so teams can confidently ship smaller, cheaper LLM payloads with this TOON converter as their QA step.
              </dd>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-gradient-to-r from-zinc-50 to-white p-4 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
              <dt className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Is TOON only for tables?
              </dt>
              <dd className="mt-1 text-zinc-600 dark:text-zinc-300">
                No—nested objects, arrays, dotted key folding, and alternative delimiters are all part of the spec.
                Uniform collections (like user lists or transactions) see the biggest savings, but TOON still mirrors
                your entire JSON structure so decoding back to JSON is straightforward. That makes this toon converter
                a practical bridge between human-readable specs and production prompt payloads.
              </dd>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-gradient-to-r from-zinc-50 to-white p-4 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
              <dt className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Where can I learn more about the TOON standard?
              </dt>
              <dd className="mt-1 text-zinc-600 dark:text-zinc-300">
                The official spec and reference implementation live at{" "}
                <a href="https://github.com/toon-format/toon" target="_blank" rel="noreferrer" className="font-semibold text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-300">
                  github.com/toon-format/toon
                </a>
                . Pair that with this toon converter to read, transform, and validate TOON alongside the source documentation.
              </dd>
            </div>
          </dl>
        </section>
      </main>
      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-xs text-zinc-500 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image src="/icon.svg" alt="TOON converter logo" width={20} height={20} />
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">TOON Converter</p>
              <p className="text-[11px] uppercase tracking-wide">All in-browser · Privacy-first</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
