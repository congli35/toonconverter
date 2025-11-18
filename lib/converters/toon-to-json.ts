import { decode, type DecodeOptions } from "@toon-format/toon";
import { Converter } from "./types";

export type ToonToJsonOptions = Required<
  Pick<DecodeOptions, "indent" | "strict" | "expandPaths">
>;

export const ToonToJsonConverter: Converter<ToonToJsonOptions> = {
  id: "toon-to-json",
  label: "TOON → JSON",
  inputMime: "text/plain",
  outputMime: "application/json",
  defaultInput: `items[2]{sku,qty,price}:
  A1,2,9.99
  B2,1,14.5`,
  defaultOptions: {
    indent: 2,
    strict: true,
    expandPaths: "off",
  },
  settingsSpec: [
    {
      key: "indent",
      label: "Indent",
      type: "number",
      options: [
        { value: 2, label: "2" },
        { value: 3, label: "3" },
        { value: 4, label: "4" },
      ],
    },
    {
      key: "strict",
      label: "Strict validation",
      type: "select",
      options: [
        { value: true, label: "On" },
        { value: false, label: "Off" },
      ],
    },
    {
      key: "expandPaths",
      label: "Expand dotted paths",
      type: "select",
      options: [
        { value: "off", label: "Off" },
        { value: "safe", label: "Safe" },
      ],
    },
  ],
  async convert(input, options) {
    const parsed = decode(input, {
      indent: options.indent,
      strict: options.strict,
      expandPaths: options.expandPaths,
    });
    return { output: JSON.stringify(parsed, null, options.indent) };
  },
  validateInput(input) {
    if (!input.trim()) {
      return { ok: false as const, message: "Enter TOON text to convert." };
    }
    return { ok: true as const };
  },
};
