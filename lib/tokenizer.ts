// Simple, pluggable token estimation service.
// Default heuristic: ~4 characters per token.
export interface Tokenizer {
  estimate(text: string): number;
}

export const HeuristicTokenizer: Tokenizer = {
  estimate(text: string) {
    return Math.ceil((text?.length ?? 0) / 4);
  },
};

