import { twMerge } from "tailwind-merge";

// Minimal cn helper to merge tailwind classes.
export function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(inputs.filter(Boolean).join(" "));
}

