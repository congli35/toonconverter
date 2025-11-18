// "use client" marks this as a client component for interactive conversion
"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getConverter } from "@/lib/converters/registry";
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
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { TokenStats } from "@/components/token-stats";
import { useTokenMetrics } from "@/lib/hooks/use-token-metrics";

export default function Home() {
  // UI state
  const converter = getConverter("json-to-toon");
  const delimiterChoices = {
    comma: "," as JsonToToonOptions["delimiter"],
    tab: "\t" as JsonToToonOptions["delimiter"],
    pipe: "|" as JsonToToonOptions["delimiter"],
  };
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

  const { inputTokens, outputTokens, savings, percent, percentLabel } = useTokenMetrics(input, output);

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
      <SiteHeader />

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
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4" role="group" aria-label="Converter settings">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">JSON to TOON Converter</h2>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-semibold">Settings</span>
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

        <TokenStats
          summaryData={{ inputTokens, savings, percent, percentLabel }}
          metrics={[
            {
              label: "JSON tokens",
              value: inputTokens,
            },
            {
              label: "TOON tokens",
              value: outputTokens,
            },
          ]}
        />

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
      <SiteFooter />

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
