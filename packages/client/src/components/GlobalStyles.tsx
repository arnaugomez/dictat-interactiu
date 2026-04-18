import { C } from "../theme/colors";

export default function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playwrite+PE:wght@100..400&family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      body{overflow-x:hidden}
      @keyframes floatB{0%{transform:translateY(0) scale(1)}100%{transform:translateY(-16px) scale(1.07)}}
      @keyframes slideD{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
      @keyframes toastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      input[type="range"]{-webkit-appearance:none;appearance:none;height:6px;border-radius:3px;background:${C.border};outline:none}
      input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,${C.primary},${C.primaryDark});cursor:pointer;box-shadow:0 2px 6px ${C.primary}44}
      input[type="range"]::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,${C.primary},${C.primaryDark});cursor:pointer;border:none}
      textarea::placeholder{color:${C.textMuted}}
      input:focus{outline:none}
      ::-webkit-scrollbar{width:8px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px}
    `}</style>
  );
}
