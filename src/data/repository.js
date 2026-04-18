const defaultTitle = () =>
  new Date().toLocaleDateString("ca-ES", { day: "numeric", month: "long", year: "numeric" });

export const DictatRepository = {
  _key: "dictats_v3",
  _read() {
    try {
      return JSON.parse(localStorage.getItem(this._key) || "[]");
    } catch {
      return [];
    }
  },
  _write(d) {
    localStorage.setItem(this._key, JSON.stringify(d));
  },
  getAll() {
    return this._read().sort((a, b) => b.updatedAt - a.updatedAt);
  },
  getById(id) {
    return this._read().find((d) => d.id === id) || null;
  },
  save(dictat) {
    const all = this._read();
    const idx = all.findIndex((d) => d.id === dictat.id);
    const now = Date.now();
    if (idx >= 0) all[idx] = { ...dictat, updatedAt: now };
    else all.push({ ...dictat, createdAt: now, updatedAt: now });
    this._write(all);
    return dictat;
  },
  remove(id) {
    this._write(this._read().filter((d) => d.id !== id));
  },
  createNew(text = "", config = {}) {
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
