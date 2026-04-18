import { toUpper } from "./tokenizer";

export function doPrint(dictat, tokens, hiddenSet, mode) {
  const fs = dictat.config.fontSize || 22;
  const ll = dictat.config.lletraPal;
  const ft = dictat.config.fontType || "impremta";
  const ffam = ft === "lligada" ? "'Playwrite PE', cursive" : "'Nunito', sans-serif";
  const disp = (s) => (ll ? toUpper(s) : s);
  const showHidden = mode === "exercici" || mode === "ambdos";
  const showText = mode === "text" || mode === "ambdos";
  const pw = window.open("", "_blank");
  if (!pw) return;

  const renderBlock = (withBlanks) => {
    let h = `<div class="wrap">`;
    tokens.forEach((t, i) => {
      if (t.type === "newline") {
        h += `<div class="nl"></div>`;
        return;
      }
      if (t.type === "space") {
        h += `<span class="sp"> </span>`;
        return;
      }
      if (t.type === "punct") {
        h += `<span>${t.value}</span>`;
        return;
      }
      if (t.type === "word" && withBlanks && hiddenSet.has(i)) {
        const w = Math.max(t.value.length * 0.9 + 0.8, 2.5);
        h += `<span class="box" style="min-width:${w}em">&nbsp;</span>`;
      } else {
        h += `<span>${disp(t.value)}</span>`;
      }
    });
    return h + `</div>`;
  };

  let body = `<h1>${disp(dictat.title || "Dictat")}</h1>`;
  if (showText) body += `<h2>Text</h2>` + renderBlock(false);
  if (showText && showHidden) body += `<div style="page-break-before:always"></div>`;
  if (showHidden) body += `<h2>Exercici</h2>` + renderBlock(true);

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${dictat.title || "Dictat"}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Playwrite+PE:wght@100..400&family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700&display=swap');
@page{margin:2cm}
body{font-family:${ffam};font-size:${fs}px;line-height:2.4;color:#000;padding:20px}
.wrap{display:flex;flex-wrap:wrap;align-items:baseline}
.box{display:inline-block;border:2px solid #000;border-radius:4px;padding:0 8px;margin:8px 1px;text-align:center;line-height:2}
.sp{display:inline-block;width:0.35em}
.nl{display:block;height:${fs * 0.7}px;flex-basis:100%}
h1{font-family:'Fredoka',sans-serif;font-size:1.3em;text-align:center;margin-bottom:16px}
h2{font-family:'Fredoka',sans-serif;font-size:0.9em;color:#666;margin:16px 0 8px}
hr{border:none;border-top:1px solid #ccc;margin:20px 0}
</style></head><body>${body}</body></html>`;
  pw.document.write(html);
  pw.document.close();
  pw.focus();
  setTimeout(() => pw.print(), 350);
}
