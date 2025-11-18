"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getConverter } from "@/lib/converters/registry";
import type { ToonToJsonOptions } from "@/lib/converters/toon-to-json";
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
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { TokenStats } from "@/components/token-stats";
import { cn } from "@/lib/utils";
import { useTokenMetrics } from "@/lib/hooks/use-token-metrics";

export default function ToonToJsonClientPage() {
  const converter = getConverter("toon-to-json");
  const fallbackInput = `items[2]{sku,qty,price}:
  A1,2,9.99
  B2,1,14.5`;
  const [input, setInput] = useState<string>(
    (converter?.defaultInput as string) ?? fallbackInput
  );
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | undefined>();
  const [options, setOptions] = useState<ToonToJsonOptions>(
    (converter?.defaultOptions as ToonToJsonOptions) ?? {
      indent: 2,
      strict: true,
      expandPaths: "off",
    }
  );

  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    if (!converter) return;
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      (async () => {
        try {
          const validation = converter.validateInput?.(input);
          if (validation && !validation.ok) {
            setError(validation.message);
            setOutput("");
            return;
          }
          const result = await converter.convert(input, options);
          setOutput(result.output);
          setError(undefined);
        } catch (err: any) {
          setOutput("");
          setError(String(err?.message ?? err));
        }
      })();
    }, 250);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [converter, input, options]);

  const { inputTokens, outputTokens, savings, percent, percentLabel } = useTokenMetrics(input, output);

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.success("JSON copied", {
        description: "Decoded JSON output is in your clipboard.",
      });
    } catch {
      toast.error("Copy failed", {
        description: "Unable to access clipboard. Please try again.",
      });
    }
  };

  const downloadOutput = () => {
    try {
      const blob = new Blob([output], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "decoded.json";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Download ready", {
        description: "JSON file is downloading now.",
      });
    } catch {
      toast.error("Download failed", {
        description: "Unable to download JSON file.",
      });
    }
  };

  const pasteSample = () => {
    setInput(fallbackInput);
    toast.info("Sample loaded", {
      description: "Try editing the sample TOON payload.",
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl grow px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4" role="group" aria-label="Converter settings">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">TOON to JSON Converter</h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold">Settings</span>
            <Label htmlFor="indent-select" className="text-sm">
              Indent
            </Label>
            <Select
              value={String(options.indent)}
              onValueChange={(value) =>
                setOptions((prev) => ({ ...prev, indent: Number(value) as ToonToJsonOptions["indent"] }))
              }
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
            <Label htmlFor="strict-select" className="text-sm">
              Strict
            </Label>
            <Select
              value={options.strict ? "true" : "false"}
              onValueChange={(value) =>
                setOptions((prev) => ({ ...prev, strict: value === "true" }))
              }
            >
              <SelectTrigger id="strict-select" className="w-[120px]" aria-label="Toggle strict validation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">On</SelectItem>
                <SelectItem value="false">Off</SelectItem>
              </SelectContent>
            </Select>
            <Label htmlFor="expand-select" className="text-sm">
              Expand paths
            </Label>
            <Select
              value={options.expandPaths}
              onValueChange={(value: ToonToJsonOptions["expandPaths"]) =>
                setOptions((prev) => ({ ...prev, expandPaths: value }))
              }
            >
              <SelectTrigger id="expand-select" className="w-[140px]" aria-label="Toggle dotted key expansion">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off">Off</SelectItem>
                <SelectItem value="safe">Safe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>TOON Input</span>
                  <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">Editable</span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="secondary" size="sm" onClick={pasteSample} aria-label="Load sample TOON">
                        Sample
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Replace input with sample TOON snippet</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                className={error ? "ring-2 ring-red-500" : ""}
                value={input}
                onChange={setInput}
                language="plaintext"
                height={320}
              />
              {error ? (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
                  {error}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>JSON Output</span>
                  <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">Read-only</span>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={copyOutput} variant="secondary" size="sm" aria-label="Copy JSON output">
                          Copy
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy decoded JSON</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={downloadOutput} variant="secondary" size="sm" aria-label="Download JSON output">
                          Download
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Download as .json</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea className="min-h-[320px]" value={output} readOnly language="json" height={320} />
            </CardContent>
          </Card>
        </div>

        <TokenStats
          summaryData={{ inputTokens, savings, percent, percentLabel }}
          metrics={[
            {
              label: "TOON tokens",
              value: inputTokens,
            },
            {
              label: "JSON tokens",
              value: outputTokens,
            },
          ]}
        />

        <section className="mt-12 grid gap-6 md:grid-cols-2" id="faq">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-xl font-semibold">Why decode TOON?</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              TOON squeezes structured data for LLM prompts, but you still need JSON for downstream systems. This
              converter keeps parity with the official decoder so you can round-trip TOON files before shipping.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-xl font-semibold">Path expansion & strict mode</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Enable strict validation to enforce row counts and data integrity, or turn it off for recovery scenarios.
              Path expansion rebuilds dotted keys when the source used key folding so your decoded JSON matches the
              original schema.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
