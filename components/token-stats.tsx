"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TokenMetric = {
  label: ReactNode;
  value: ReactNode;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  unstyled?: boolean;
};

type TokenStatsProps = {
  summaryData?: {
    inputTokens: number;
    savings: number;
    percent: number;
    percentLabel: string;
  };
  metrics: TokenMetric[];
  ariaLabel?: string;
  showPrimary?: boolean;
};

export function TokenStats({
  summaryData,
  metrics,
  ariaLabel = "Token statistics",
  showPrimary = true,
}: TokenStatsProps) {
  const data =
    summaryData ??
    ({
      inputTokens: 0,
      savings: 0,
      percent: 0,
      percentLabel: "0%",
    } satisfies TokenStatsProps["summaryData"]);
  const computedSummary = (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Token impact</p>
      <h3
        className={cn(
          "mt-1 text-3xl font-bold",
          data.savings >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
        )}
      >
        {data.inputTokens === 0
          ? "No savings yet"
          : `${data.percentLabel} tokens`}
      </h3>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Powered by{" "}
        <a
          href="https://github.com/niieani/gpt-tokenizer"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline-offset-2 transition-colors hover:text-zinc-900 hover:underline dark:hover:text-zinc-200"
        >
          gpt-tokenizer
        </a>{" "}
        (o200k_base · GPT-5 tokenizer)
      </p>
    </div>
  );
  const summaryContent = computedSummary;
  const derivedMetrics: TokenMetric[] = [
    ...metrics,
    ...(showPrimary
      ? [
          {
            label: data.savings >= 0 ? "Saved" : "Overhead",
            value: (
              <>
                {Math.abs(data.savings)}
              </>
            ),
            className:
              data.savings >= 0
                ? "border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/70"
                : "border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/70",
            labelClassName: "text-xs font-semibold uppercase tracking-wider",
            valueClassName: cn(
              "mt-1 text-2xl font-bold",
              data.savings > 0
                ? "text-emerald-700 dark:text-emerald-300"
                : data.savings < 0
                  ? "text-amber-700 dark:text-amber-300"
                  : "text-zinc-900 dark:text-zinc-50"
            ),
          },
        ]
      : []),
  ];

  return (
    <section
      className="mt-6 rounded-2xl border border-zinc-200 bg-gradient-to-br from-white via-white to-zinc-50/50 p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950/50"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>{summaryContent}</div>
        <div className="grid w-full gap-4 md:w-auto md:grid-cols-3">
          {derivedMetrics.map((metric, index) => {
            const wrapperClass = cn(
              "rounded-xl p-4 shadow-sm transition-shadow hover:shadow",
              metric.className ?? "border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
            );
            const labelClass = cn(
              "text-xs font-medium text-zinc-500 dark:text-zinc-400",
              metric.labelClassName
            );
            const valueClass = cn(
              "mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50",
              metric.valueClassName
            );
            return (
              <div key={index} className={wrapperClass}>
                <p className={labelClass}>{metric.label}</p>
                <p className={valueClass}>{metric.value}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
