import { JsonToToonConverter, type JsonToToonOptions } from "./json-to-toon";
import { ToonToJsonConverter, type ToonToJsonOptions } from "./toon-to-json";
import { Converter, ConverterId } from "./types";

export type AnyOptions = JsonToToonOptions | ToonToJsonOptions;
export type AnyConverter = Converter<any>;

const converters: Record<ConverterId, AnyConverter | undefined> = {
  "json-to-toon": JsonToToonConverter,
  "toon-to-json": ToonToJsonConverter,
  "xml-to-json": undefined,
};

export function getConverter(id: ConverterId): AnyConverter | undefined {
  return converters[id];
}

export function listConverters(): AnyConverter[] {
  return Object.values(converters).filter(Boolean) as AnyConverter[];
}
