"use client";

import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToonOutputCardProps {
    output: string;
    className?: string;
}

export function ToonOutputCard({ output, className }: ToonOutputCardProps) {
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

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span>TOON Output</span>
                        <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
                            Read-only
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={copyOutput}
                                        variant="secondary"
                                        size="sm"
                                        aria-label="Copy TOON output to clipboard"
                                    >
                                        Copy
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy output to clipboard</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={downloadOutput}
                                        variant="secondary"
                                        size="sm"
                                        aria-label="Download TOON output as file"
                                    >
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
                <Textarea
                    className="min-h-[320px]"
                    value={output}
                    readOnly
                    height={320}
                />
            </CardContent>
        </Card>
    );
}
