interface FontMap {
  display: string;
  body: string;
  cursive: string;
}

export const F: FontMap = {
  display: "'Fredoka', 'Nunito', sans-serif",
  body: "'Nunito', sans-serif",
  cursive: "'Playwrite PE', 'Pacifico', cursive",
};

export const getFont = (fontType: string, isDisplay: boolean): string => {
  if (fontType === "lligada") return F.cursive;
  return isDisplay ? F.display : F.body;
};
