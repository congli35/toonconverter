import { Converter } from "./types";
import { encodeToToon, type Delimiter } from "@/lib/toon/encoder";
import { safeParseJson } from "@/lib/utils/json";

export type JsonToToonOptions = {
  indent: number;
  delimiter: Delimiter;
  keyFolding: "off" | "safe";
};

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
    const parsed = safeParseJson(input);
    if (!parsed.ok) {
      throw new Error(parsed.message);
    }
    return { output: encodeToToon(parsed.value, options) };
  },
  validateInput(input) {
    const parsed = safeParseJson(input);
    return parsed.ok ? { ok: true } : { ok: false, message: parsed.message };
  },
};

