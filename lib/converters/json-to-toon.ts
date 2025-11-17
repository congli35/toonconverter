import { encode, type EncodeOptions, type Delimiter } from "@toon-format/toon";
import { Converter } from "./types";

export type JsonToToonOptions = Required<Pick<EncodeOptions, "indent" | "delimiter" | "keyFolding">>;

export const JsonToToonConverter: Converter<JsonToToonOptions> = {
  id: "json-to-toon",
  label: "JSON → TOON",
  inputMime: "application/json",
  outputMime: "text/plain",
  defaultInput:
    '{"users":[{"id":1,"name":"Alice","role":"admin","active":true},{"id":2,"name":"Bob","role":"user","active":true},{"id":3,"name":"Charlie","role":"user","active":false}]}',
  defaultOptions: {
    indent: 2,
    delimiter: ",",
    keyFolding: "off",
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
      key: "delimiter",
      label: "Delimiter",
      type: "select",
      options: [
        { value: ",", label: "Comma" },
        { value: "\t", label: "Tab" },
        { value: "|", label: "Pipe" },
      ],
    },
  ],
  async convert(input, options) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(input);
    } catch (error: any) {
      throw new Error(error?.message ?? "Invalid JSON input");
    }
    return { output: encode(parsed, options) };
  },
  validateInput(input) {
    return { ok: true };
  },
};
