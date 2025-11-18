"use client";

import { useMemo } from "react";
import { GPTTokenizer } from "@/lib/tokenizer";

export type TokenMetrics = {
  inputTokens: number;
  outputTokens: number;
  savings: number;
  percent: number;
  percentLabel: string;
};

export function useTokenMetrics(input: string, output: string): TokenMetrics {
  return useMemo(() => {
    const inputTokens = GPTTokenizer.estimate(input);
    const outputTokens = GPTTokenizer.estimate(output);
    const savings = inputTokens > 0 ? inputTokens - outputTokens : 0;
    const percent = inputTokens > 0 ? Math.round((savings / inputTokens) * 100) : 0;
    const percentLabel =
      inputTokens === 0 ? "0%" : `${percent > 0 ? `-${percent}` : `+${Math.abs(percent)}`}%`;
    return { inputTokens, outputTokens, savings, percent, percentLabel };
  }, [input, output]);
}
