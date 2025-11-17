export type Delimiter = "," | "\t" | "|";
export type KeyFolding = "off" | "safe";

export type JsonToToonOptions = {
  indent: number;
  delimiter: Delimiter;
  keyFolding: KeyFolding;
};

// Minimal TOON encoder to run in-browser.
export function encodeToToon(
  data: any,
  options: JsonToToonOptions,
  rootKey?: string,
  level: number = 0
): string {
  const lines: string[] = [];
  const indentUnit = " ".repeat(options.indent);
  const delim = options.delimiter;

  const write = (line: string) => lines.push(line);

  const quoteIfNeeded = (s: string): string => {
    const needsQuote =
      s.length === 0 ||
      /^\s|\s$/.test(s) ||
      s.includes("\n") ||
      s.includes("\r") ||
      s.includes(",") ||
      s.includes(":") ||
      (delim !== "," && s.includes(delim)) ||
      s.startsWith("- ") ||
      /^(true|false|null)$/i.test(s) ||
      /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(s);
    if (!needsQuote) return s;
    const escaped = s.replace(/"/g, '\\"');
    return `"${escaped}"`;
  };

  const renderScalar = (v: any): string => {
    if (v === null) return "null";
    if (typeof v === "boolean") return v ? "true" : "false";
    if (typeof v === "number") {
      if (!isFinite(v)) return quoteIfNeeded(String(v));
      return String(v);
    }
    if (typeof v === "string") return quoteIfNeeded(v);
    return quoteIfNeeded(JSON.stringify(v));
  };

  const isPlainObject = (x: any) => x && typeof x === "object" && !Array.isArray(x);
  const isUniformObjectArray = (arr: any[]) =>
    arr.length > 0 && arr.every((it) => isPlainObject(it));
  const isPrimitive = (v: any) =>
    v === null || ["string", "number", "boolean"].includes(typeof v);

  const encodeObject = (obj: Record<string, any>, lvl: number) => {
    const keys = Object.keys(obj);
    for (const k of keys) {
      encodeEntry(k, obj[k], lvl);
    }
  };

  const encodeEntry = (key: string, value: any, lvl: number) => {
    const ind = indentUnit.repeat(lvl);
    if (Array.isArray(value)) {
      if (value.length === 0) {
        write(`${ind}${key}[0]:`);
        return;
      }
      const n = value.length;
      if (value.every(isPrimitive)) {
        const row = value.map(renderScalar).join(delim);
        write(`${ind}${key}[${n}]: ${row}`);
        return;
      }
      if (value.every(Array.isArray)) {
        write(`${ind}${key}[${n}]:`);
        for (const sub of value) {
          if (sub.every(isPrimitive)) {
            write(`${ind}${indentUnit}- [${sub.length}]: ${sub.map(renderScalar).join(delim)}`);
          } else {
            write(`${ind}${indentUnit}- [${sub.length}]:`);
            for (const subItem of sub) {
              if (isPlainObject(subItem)) {
                encodeObject(subItem, lvl + 2);
              } else {
                write(`${ind}${indentUnit}${indentUnit}- ${renderScalar(subItem)}`);
              }
            }
          }
        }
        return;
      }
      if (isUniformObjectArray(value)) {
        const headerKeys: string[] = [];
        for (const row of value) {
          for (const k of Object.keys(row)) {
            if (!headerKeys.includes(k)) headerKeys.push(k);
          }
        }
        const header = `{${headerKeys.join(delim)}}`;
        write(`${ind}${key}[${n}]${header}:`);
        for (const row of value) {
          const rowVals = headerKeys.map((hk) => renderScalar(row[hk]));
          write(`${ind}${indentUnit}${rowVals.join(delim)}`);
        }
        return;
      }
      write(`${ind}${key}[${n}]:`);
      for (const item of value) {
        if (isPrimitive(item)) {
          write(`${ind}${indentUnit}- ${renderScalar(item)}`);
        } else if (isPlainObject(item)) {
          write(`${ind}${indentUnit}- ${""}`.trimEnd());
          encodeObject(item, lvl + 2);
        } else if (Array.isArray(item)) {
          write(`${ind}${indentUnit}- [${item.length}]: ${item.map(renderScalar).join(delim)}`);
        } else {
          write(`${ind}${indentUnit}- ${renderScalar(item)}`);
        }
      }
      return;
    }

    if (isPlainObject(value)) {
      write(`${ind}${key}:`);
      encodeObject(value, lvl + 1);
      return;
    }

    write(`${ind}${key}: ${renderScalar(value)}`);
  };

  if (rootKey !== undefined) {
    encodeEntry(rootKey, data, level);
  } else {
    if (isPlainObject(data)) {
      encodeObject(data, level);
    } else if (Array.isArray(data)) {
      encodeEntry("data", data, level);
    } else {
      encodeEntry("value", data, level);
    }
  }
  return lines.join("\n");
}
