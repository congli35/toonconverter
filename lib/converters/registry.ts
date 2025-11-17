import { JsonToToonConverter, type JsonToToonOptions } from "./json-to-toon";
import { Converter, ConverterId } from "./types";

export type AnyOptions = JsonToToonOptions;
export type AnyConverter = Converter<any>;

const converters: Record<ConverterId, AnyConverter | undefined> = {
  "json-to-toon": JsonToToonConverter,
  "toon-to-json": undefined,
  "xml-to-json": undefined,
};

export function getConverter(id: ConverterId): AnyConverter | undefined {
  return converters[id];
}

export function listConverters(): AnyConverter[] {
  return Object.values(converters).filter(Boolean) as AnyConverter[];
}

