export interface DictatConfig {
  lletraPal: boolean;
  fontSize: number;
  hidePct: number;
  fontType: "impremta" | "lligada";
}

export interface Dictat {
  id: string;
  title: string;
  text: string;
  config: DictatConfig;
  hiddenIndices: number[];
  createdAt: number;
  updatedAt: number;
}
