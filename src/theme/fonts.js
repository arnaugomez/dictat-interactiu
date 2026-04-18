export const F = {
  display: "'Fredoka', 'Nunito', sans-serif",
  body: "'Nunito', sans-serif",
  cursive: "'Playwrite PE', 'Pacifico', cursive",
};

export const getFont = (fontType, isDisplay) => {
  if (fontType === "lligada") return F.cursive;
  return isDisplay ? F.display : F.body;
};
