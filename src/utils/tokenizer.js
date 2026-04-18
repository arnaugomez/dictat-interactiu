export function tokenize(text) {
  const tokens = [];
  const regex = /([a-zA-ZÀ-ÿ·'''-]+)|(\n)|([^\S\n]+)|([^\sa-zA-ZÀ-ÿ·'''-]+)/g;
  let m;
  while ((m = regex.exec(text)) !== null) {
    if (m[1]) tokens.push({ type: "word", value: m[1] });
    else if (m[2]) tokens.push({ type: "newline", value: "\n" });
    else if (m[3]) tokens.push({ type: "space", value: m[3] });
    else if (m[4]) tokens.push({ type: "punct", value: m[4] });
  }
  return tokens;
}

export function computeHiddenIndices(tokens, pct) {
  const wi = tokens.map((t, i) => (t.type === "word" ? i : -1)).filter((i) => i >= 0);
  const count = Math.max(1, Math.round((pct / 100) * wi.length));
  return [...wi]
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .sort((a, b) => a - b);
}

export const toUpper = (s) => s.toUpperCase();
export const isAlphaChar = (ch) => /[a-zA-ZÀ-ÿ·'''-]/.test(ch);
