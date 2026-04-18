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

const defaultTitle = (): string =>
  new Date().toLocaleDateString("ca-ES", { day: "numeric", month: "long", year: "numeric" });

export const DictatRepository = {
  _key: "dictats_v3" as string,
  _read(): Dictat[] {
    try {
      return JSON.parse(localStorage.getItem(this._key) ?? "[]") as Dictat[];
    } catch {
      return [];
    }
  },
  _write(d: Dictat[]): void {
    localStorage.setItem(this._key, JSON.stringify(d));
  },
  getAll(): Dictat[] {
    return this._read().sort((a, b) => b.updatedAt - a.updatedAt);
  },
  getById(id: string): Dictat | null {
    return this._read().find((d) => d.id === id) ?? null;
  },
  save(dictat: Dictat): Dictat {
    const all = this._read();
    const idx = all.findIndex((d) => d.id === dictat.id);
    const now = Date.now();
    if (idx >= 0) all[idx] = { ...dictat, updatedAt: now };
    else all.push({ ...dictat, createdAt: now, updatedAt: now });
    this._write(all);
    return dictat;
  },
  remove(id: string): void {
    this._write(this._read().filter((d) => d.id !== id));
  },
  createNew(text: string = "", config: Partial<DictatConfig> = {}): Dictat {
    return {
      id: "d_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
      title: defaultTitle(),
      text,
      config: { lletraPal: false, fontSize: 22, hidePct: 100, fontType: "impremta", ...config },
      hiddenIndices: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  },
};

export { defaultTitle };
