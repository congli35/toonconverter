// Simple, pluggable token estimation service.
export interface Tokenizer {
  estimate(text: string): number;
}

// Default heuristic: ~4 characters per token.
export const HeuristicTokenizer: Tokenizer = {
  estimate(text: string) {
    return Math.ceil((text?.length ?? 0) / 4);
  },
};

// GPT tokenizer-backed estimator using gpt-tokenizer.
let gptEstimator: Tokenizer | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { countTokens } = require("gpt-tokenizer") as { countTokens: (t: string) => number };
  gptEstimator = {
    estimate(text: string) {
      return countTokens(text ?? "");
    },
  };
} catch {
  gptEstimator = null;
}

export const GPTTokenizer: Tokenizer = gptEstimator ?? HeuristicTokenizer;
