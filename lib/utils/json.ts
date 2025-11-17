// Safe JSON parse with position to line/column mapping to improve UX error messages
export function safeParseJson(input: string): { ok: true; value: any } | { ok: false; message: string } {
  try {
    const value = JSON.parse(input);
    return { ok: true, value };
  } catch (err: any) {
    const msg: string = String(err?.message ?? "Invalid JSON");
    const m = msg.match(/at position (\d+)/);
    if (m) {
      const pos = Number(m[1]);
      const { line, column } = positionToLineCol(input, pos);
      return { ok: false, message: `JSON error at ${line}:${column} - ${msg}` };
    }
    return { ok: false, message: msg };
  }
}

export function positionToLineCol(text: string, pos: number): { line: number; column: number } {
  let line = 1;
  let col = 1;
  for (let i = 0; i < pos && i < text.length; i++) {
    const ch = text.charAt(i);
    if (ch === "\n") {
      line++;
      col = 1;
    } else {
      col++;
    }
  }
  return { line, column: col };
}
