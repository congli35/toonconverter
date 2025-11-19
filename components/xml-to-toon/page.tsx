"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getConverter } from "@/lib/converters/registry";
import type { XmlToToonOptions } from "@/lib/converters/xml-to-toon";
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
import { useTokenMetrics } from "@/lib/hooks/use-token-metrics";
import { ToonOutputCard } from "@/components/toon-output-card";

export default function XmlToToonClientPage() {
    const converter = getConverter("xml-to-toon");
    const delimiterChoices = {
        comma: "," as XmlToToonOptions["delimiter"],
        tab: "\t" as XmlToToonOptions["delimiter"],
        pipe: "|" as XmlToToonOptions["delimiter"],
    };

    const [input, setInput] = useState<string>(
        (converter?.defaultInput as string) ??
        '<users>\n  <user>\n    <id>1</id>\n    <name>Alice</name>\n  </user>\n</users>'
    );
    const [output, setOutput] = useState<string>("");
    const [error, setError] = useState<string | undefined>();
    const [options, setOptions] = useState<XmlToToonOptions>({
        indent: 2,
        delimiter: ",",
        keyFolding: "off",
    });

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



    return (
        <div className="flex min-h-screen w-full flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
            <SiteHeader />

            <main className="mx-auto w-full max-w-6xl grow px-4 py-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4" role="group" aria-label="Converter settings">
                    <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">XML to TOON Converter</h1>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-semibold">Settings</span>
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
                    {/* Left: XML input */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span>XML Input</span>
                                    <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">Editable</span>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                className={error ? "ring-2 ring-red-500" : ""}
                                value={input}
                                onChange={setInput}
                                height={320}
                                language="xml"
                            />
                            {error ? (
                                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400" role="alert" aria-live="polite">
                                    {error}
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>

                    {/* Right: TOON output */}
                    <ToonOutputCard output={output} />
                </div>

                <TokenStats
                    summaryData={{ inputTokens, savings, percent, percentLabel }}
                    metrics={[
                        {
                            label: "XML tokens",
                            value: inputTokens,
                        },
                        {
                            label: "TOON tokens",
                            value: outputTokens,
                        },
                    ]}
                />
            </main>
            <SiteFooter />
        </div>
    );
}
