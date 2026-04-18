export const EXAMPLES: string[] = [
  "El gat juga al jardí.\nLa nena menja una poma vermella.\nEl sol brilla molt avui.",
  "La lluna surt de nit.\nEls estels fan llum al cel.\nEl vent mou les fulles dels arbres.",
  "El peix neda al riu.\nLa granota salta sobre la pedra.\nEl bosc està ple de vida.",
  "La mare fa un pastís.\nEl pare llegeix un conte.\nEls nens riuen i juguen junts.",
  "El gos corre pel parc.\nLa papallona vola entre les flors.\nLa pluja cau suaument.",
  "El tren passa pel pont.\nLes muntanyes són molt altes.\nEl camí porta al poble.",
  "La mestra escriu a la pissarra.\nEls alumnes escolten amb atenció.\nAvui aprenem coses noves.",
  "El conill menja una pastanaga.\nL'ocell canta una cançó bonica.\nEl camp és verd i gran.",
  "La nena dibuixa un arbre.\nEl nen pinta un cel blau.\nFem art amb molts colors.",
  "El pa és calent i bo.\nLa sopa té verdures fresques.\nDinem junts a la taula.",
];

export const randomExample = (): string =>
  EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)] ?? EXAMPLES[0];
