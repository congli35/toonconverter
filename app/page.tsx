// "use client" marks this as a client component for interactive conversion
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
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
import { cn } from "@/lib/utils";

type ConvertResult = {
  output: string;
  error?: string;
};

export default function Home() {
  // UI state
  const firstConverter = listConverters()[0];
  const delimiterChoices = {
    comma: "," as JsonToToonOptions["delimiter"],
    tab: "\t" as JsonToToonOptions["delimiter"],
    pipe: "|" as JsonToToonOptions["delimiter"],
  };
  const [converterId, setConverterId] = useState<ConverterId>(
    (firstConverter?.id as ConverterId) ?? "json-to-toon"
  );
  const converter = useMemo(() => getConverter(converterId), [converterId]);
  const [input, setInput] = useState<string>(
    (converter?.defaultInput as string) ??
      '{"orders":[{"orderId":"ORD-1001","customer":{"name":"Alice","tier":"Gold"},"items":[{"sku":"A1","qty":2,"price":19.99},{"sku":"B4","qty":1,"price":49.5}],"total":89.48},{"orderId":"ORD-1002","customer":{"name":"Bob","tier":"Silver"},"items":[{"sku":"A1","qty":1,"price":19.99},{"sku":"C7","qty":3,"price":12.5}],"total":57.49}]}'
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
  const percentLabel =
    inputTokens === 0 ? "0%" : `${percent > 0 ? `-${percent}` : `+${Math.abs(percent)}`}%`;

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Copied to clipboard!", {
        description: "TOON output has been copied successfully.",
      });
    } catch {
      toast.error("Failed to copy", {
        description: "Could not copy to clipboard. Please try again.",
      });
    }
  };

  const downloadOutput = () => {
    try {
      const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "output.toon";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Download started!", {
        description: "Your TOON file is being downloaded.",
      });
    } catch {
      toast.error("Download failed", {
        description: "Could not download the file. Please try again.",
      });
    }
  };

  const prettifyInput = () => {
    const parsed = safeParseJson(input);
    if (!parsed.ok) {
      setError(parsed.message);
      toast.error("Invalid JSON", {
        description: parsed.message,
      });
      return;
    }
    const formatted = JSON.stringify(parsed.value, null, 2);
    setInput(formatted);
    setError(undefined);
    toast.success("JSON formatted!", {
      description: "Your JSON has been prettified.",
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <header className="sticky top-0 z-10 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-black/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Image src="/icon.svg" alt="TOON converter logo" width={28} height={28} priority />
            <span className="text-base font-semibold tracking-tight">TOON Converter</span>
          </div>
          <nav className="flex items-center gap-6 text-sm" aria-label="Main navigation">
            <Link href="/" className="font-medium transition-colors hover:text-zinc-600 dark:hover:text-zinc-300">
              JSON to TOON
            </Link>
            <Link href="#faq" className="font-medium transition-colors hover:text-zinc-600 dark:hover:text-zinc-300">
              FAQ
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl grow px-4 py-8">
        <h1 className="mb-3 text-4xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 text-center">
          TOON Converter - Save Tokens with TOON
        </h1>
        <p className="mb-4 max-w-3xl text-lg text-zinc-700 dark:text-zinc-300 text-center mx-auto">
          A privacy-first toon converter that shrinks structured data into TOON format in your browser—no uploads, just
          lighter payloads and fewer tokens for cheaper, faster LLM prompts.
        </p>
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200" role="note" aria-label="Privacy notice">
          All conversions run entirely in your browser—data never leaves this page.
        </div>
        <div className="mb-6 flex flex-wrap items-center gap-4" role="group" aria-label="Converter settings">
          <span className="text-sm font-semibold">Converter</span>
          <Select
            value={converterId}
            onValueChange={(id: ConverterId) => {
              setConverterId(id);
              const next = getConverter(id);
              if (next?.defaultInput) setInput(String(next.defaultInput));
            }}
          >
            <SelectTrigger className="w-[200px]" aria-label="Select converter type">
              <SelectValue placeholder="Select converter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json-to-toon">JSON to TOON</SelectItem>
              <SelectItem value="toon-to-json" disabled>
                TOON to JSON (coming soon)
              </SelectItem>
              <SelectItem value="xml-to-json" disabled>
                XML to JSON (coming soon)
              </SelectItem>
            </SelectContent>
          </Select>

          <span className="ml-4 text-sm font-semibold">Settings</span>
          <Label htmlFor="indent-select" className="text-sm">Indent</Label>
          <Select
            value={String(options.indent)}
            onValueChange={(v) => setOptions((o) => ({ ...o, indent: Number(v) }))}
          >
            <SelectTrigger id="indent-select" className="w-[80px]" aria-label="Select indent size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
            </SelectContent>
          </Select>

          <Label htmlFor="delimiter-select" className="text-sm">Delimiter</Label>
          <Select
            value={
              (Object.entries(delimiterChoices).find(([, char]) => char === options.delimiter)?.[0] ??
                "comma") as keyof typeof delimiterChoices
            }
            onValueChange={(v) =>
              setOptions((o) => ({
                ...o,
                delimiter: delimiterChoices[v as keyof typeof delimiterChoices],
              }))
            }
          >
            <SelectTrigger id="delimiter-select" className="w-[140px]" aria-label="Select delimiter type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comma">Comma</SelectItem>
              <SelectItem value="tab">Tab</SelectItem>
              <SelectItem value="pipe">Pipe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left: JSON input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>JSON Input</span>
                  <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">Editable</span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={prettifyInput} variant="secondary" size="sm" aria-label="Prettify JSON input">
                        Prettify JSON
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Format the left JSON input</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                className={error ? "ring-2 ring-red-500" : ""}
                value={input}
                onChange={setInput}
                height={320}
              />
              {error ? (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400" role="alert" aria-live="polite">
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
                  <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">Read-only</span>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={copyOutput} variant="secondary" size="sm" aria-label="Copy TOON output to clipboard">
                          Copy
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy output to clipboard</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={downloadOutput} variant="secondary" size="sm" aria-label="Download TOON output as file">
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
        <section className="mt-6 rounded-2xl border border-zinc-200 bg-gradient-to-br from-white via-white to-zinc-50/50 p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950/50" aria-label="Token statistics">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Token impact</p>
              <h3 className="mt-1 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {inputTokens === 0
                  ? "No savings yet"
                  : savings > 0
                    ? `-${percent}% tokens`
                    : `+${Math.abs(percent)}% tokens`}
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Powered by{" "}
                <a href="https://github.com/niieani/gpt-tokenizer" target="_blank" rel="noreferrer" className="font-medium underline-offset-2 transition-colors hover:text-zinc-900 hover:underline dark:hover:text-zinc-200">
                  gpt-tokenizer
                </a>{" "}
                (o200k_base · GPT-5 tokenizer)
              </p>
            </div>
            <div className="grid w-full gap-4 md:w-auto md:grid-cols-3">
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">JSON tokens</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{inputTokens}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">TOON tokens</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{outputTokens}</p>
              </div>
              <div className={`rounded-xl p-4 text-emerald-900 shadow-sm transition-shadow hover:shadow dark:bg-emerald-950/70 ${
                savings >= 0
                  ? "border border-emerald-200 bg-emerald-50 dark:border-emerald-800"
                  : "border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/70"
              }`}>
                <p className="text-xs font-semibold uppercase tracking-wider">
                  {savings >= 0 ? "Saved" : "Overhead"}
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {savings}{" "}
                  <span className={cn("text-sm font-semibold", savings >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300")}>
                    ({percentLabel})
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEO-friendly FAQ */}
        <section id="faq" className="mt-8 space-y-6 rounded-2xl border border-zinc-200 bg-white/80 p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              TOON Converter FAQ
            </p>
            <h2 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Everything you need to know about saving tokens with TOON
            </h2>
            <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
              This toon converter keeps every transformation in the browser. Paste any JSON on the left editor
              and see a compressed, LLM-ready TOON representation instantly—no uploads, no waiting.
            </p>
          </div>
          <dl className="space-y-5">
            <div className="rounded-xl border border-zinc-200 bg-gradient-to-r from-zinc-50 to-white p-6 transition-all hover:shadow-md dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
              <dt className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                What exactly is the TOON format?
              </dt>
              <dd className="mt-2 text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
                TOON (Token-Oriented Object Notation) is a compact, lossless representation of JSON that lists array lengths,
                flattens columns for uniform objects, and trims whitespace to reduce token counts for LLM prompts.
                Think of it as CSV&apos;s efficiency with JSON&apos;s structure, perfect for feeding structured data to GPT-5 and beyond—and this toon converter turns that theory into a copy-paste workflow.
              </dd>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-gradient-to-r from-zinc-50 to-white p-6 transition-all hover:shadow-md dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
              <dt className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Why convert JSON to TOON with this tool?
              </dt>
              <dd className="mt-2 text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
                The dual Monaco editors, live tokenizer, and delimiter controls make this toon converter ideal for exploring
                how much prompt budget you can save. You can verify schema fidelity instantly while our token stats quantify
                the improvements, so teams can confidently ship smaller, cheaper LLM payloads with this TOON converter as their QA step.
              </dd>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-gradient-to-r from-zinc-50 to-white p-6 transition-all hover:shadow-md dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
              <dt className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Is TOON only for tables?
              </dt>
              <dd className="mt-2 text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
                No—nested objects, arrays, dotted key folding, and alternative delimiters are all part of the spec.
                Uniform collections (like user lists or transactions) see the biggest savings, but TOON still mirrors
                your entire JSON structure so decoding back to JSON is straightforward. That makes this toon converter
                a practical bridge between human-readable specs and production prompt payloads.
              </dd>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-gradient-to-r from-zinc-50 to-white p-6 transition-all hover:shadow-md dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
              <dt className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Where can I learn more about the TOON standard?
              </dt>
              <dd className="mt-2 text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
                The official spec and reference implementation live at{" "}
                <a href="https://github.com/toon-format/toon" target="_blank" rel="noreferrer" className="font-bold text-emerald-700 underline-offset-2 transition-colors hover:text-emerald-800 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300">
                  github.com/toon-format/toon
                </a>
                . Pair that with this toon converter to read, transform, and validate TOON alongside the source documentation.
              </dd>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-gradient-to-r from-zinc-50 to-white p-6 transition-all hover:shadow-md dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
              <dt className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                What powers the token savings math?
              </dt>
              <dd className="mt-2 text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
                We use{" "}
                <a href="https://github.com/niieani/gpt-tokenizer" target="_blank" rel="noreferrer" className="font-bold text-emerald-700 underline-offset-2 transition-colors hover:text-emerald-800 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300">
                  gpt-tokenizer
                </a>{" "}
                (o200k_base, GPT-5 style) entirely in the browser, so the savings you see come from the same tokenizer you&apos;d rely on for production prompts.
                That makes this toon converter an accurate preview of LLM costs before you ship.
              </dd>
            </div>
          </dl>
        </section>
      </main>
      <footer className="border-t border-zinc-200 bg-white/50 dark:border-zinc-800 dark:bg-zinc-950/30">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 text-sm text-zinc-600 dark:text-zinc-400 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <Image src="/icon.svg" alt="TOON converter logo" width={24} height={24} />
            <div>
              <p className="text-base font-bold text-zinc-900 dark:text-zinc-50">TOON Converter</p>
              <p className="text-xs font-medium uppercase tracking-wider">All in-browser · Privacy-first</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-10">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Quick links
              </p>
              <div className="mt-2 flex flex-col gap-2 text-sm">
                <Link href="/" className="hover:underline">
                  JSON to TOON
                </Link>
                <Link href="#faq" className="hover:underline">
                  FAQ
                </Link>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Resources
              </p>
              <div className="mt-2 flex flex-col gap-2 text-sm">
                <a href="https://github.com/toon-format/toon" target="_blank" rel="noreferrer" className="hover:underline">
                  TOON Spec
                </a>
                <a href="https://github.com/niieani/gpt-tokenizer" target="_blank" rel="noreferrer" className="hover:underline">
                  GPT Tokenizer
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* FAQ structured data for richer snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'What exactly is the TOON format?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text:
                    'TOON (Token-Oriented Object Notation) is a compact, lossless representation of JSON that lists array lengths, flattens columns for uniform objects, and trims whitespace to reduce token counts for LLM prompts.',
                },
              },
              {
                '@type': 'Question',
                name: 'Why convert JSON to TOON with this tool?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text:
                    'The dual editors, live tokenizer, and delimiter controls make this toon converter ideal for exploring token savings while keeping schema fidelity for production LLM prompts.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is TOON only for tables?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text:
                    'No—nested objects, arrays, dotted key folding, and alternative delimiters are all part of the spec, making the toon converter useful beyond tabular data.',
                },
              },
              {
                '@type': 'Question',
                name: 'Where can I learn more about the TOON standard?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text:
                    'Visit github.com/toon-format/toon for the official spec and reference implementation to pair with this toon converter.',
                },
              },
              {
                '@type': 'Question',
                name: 'What powers the token savings math?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text:
                    'We use the gpt-tokenizer (o200k_base) entirely in the browser so the token savings shown by the toon converter match production LLM tokenization.',
                },
              },
            ],
          }),
        }}
      />
    </div>
  );
}
