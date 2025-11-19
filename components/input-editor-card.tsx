"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ReactNode } from "react";

interface InputEditorCardProps {
    title: string;
    value: string;
    onChange: (value: string) => void;
    language?: string;
    error?: string;
    action?: ReactNode;
    className?: string;
}

export function InputEditorCard({
    title,
    value,
    onChange,
    language = "json",
    error,
    action,
    className,
}: InputEditorCardProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span>{title}</span>
                        <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
                            Editable
                        </span>
                    </div>
                    {action}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Textarea
                    className={error ? "ring-2 ring-red-500" : ""}
                    value={value}
                    onChange={onChange}
                    language={language}
                    height={320}
                />
                {error ? (
                    <div
                        className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400"
                        role="alert"
                        aria-live="polite"
                    >
                        {error}
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
