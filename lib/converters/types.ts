export type ConverterId = "json-to-toon" | "toon-to-json" | "xml-to-json";

export type SettingType = "select" | "number" | "boolean";

export type SettingSpec<OptionT> = {
  key: keyof OptionT;
  type: SettingType;
  label: string;
  options?: Array<{ value: any; label: string }>;
};

export interface Converter<OptionT> {
  id: ConverterId;
  label: string;
  inputMime: string;
  outputMime: string;
  defaultInput?: string;
  defaultOptions: OptionT;
  settingsSpec?: Array<SettingSpec<OptionT>>;
  convert: (input: string, options: OptionT) => Promise<{ output: string }>;
  validateInput?: (input: string) => { ok: true } | { ok: false; message: string };
}

