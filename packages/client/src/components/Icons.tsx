import type { ReactElement, ReactNode, SVGProps } from "react";
import { C } from "../theme/colors";

interface IcProps extends SVGProps<SVGSVGElement> {
  children?: ReactNode;
  size?: number;
  fc?: string;
}

const Ic = ({ children, size = 20, ...p }: IcProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    {children}
  </svg>
);

export const I: Record<string, (p?: IcProps) => ReactElement> = {
  back: (p) => (
    <Ic {...p}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </Ic>
  ),
  plus: (p) => (
    <Ic {...p}>
      <path d="M12 5v14M5 12h14" />
    </Ic>
  ),
  edit: (p) => (
    <Ic {...p}>
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </Ic>
  ),
  trash: (p) => (
    <Ic {...p}>
      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      <path d="M10 11v6M14 11v6" />
    </Ic>
  ),
  play: (p) => (
    <Ic {...p}>
      <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none" />
    </Ic>
  ),
  check: (p) => (
    <Ic {...p}>
      <path d="M20 6L9 17l-5-5" strokeWidth="2.5" />
    </Ic>
  ),
  print: (p) => (
    <Ic {...p}>
      <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </Ic>
  ),
  settings: (p) => (
    <Ic {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </Ic>
  ),
  list: (p) => (
    <Ic {...p}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </Ic>
  ),
  tBig: (p) => (
    <Ic {...p} viewBox="0 0 28 24" strokeWidth="0" fill="currentColor">
      <text x="1" y="20" style={{ fontSize: "18px", fontWeight: 800, fontFamily: "sans-serif" }}>
        A
      </text>
      <text x="17" y="12" style={{ fontSize: "14px", fontWeight: 800, fontFamily: "sans-serif" }}>
        +
      </text>
    </Ic>
  ),
  tSmall: (p) => (
    <Ic {...p} viewBox="0 0 28 24" strokeWidth="0" fill="currentColor">
      <text x="3" y="20" style={{ fontSize: "14px", fontWeight: 800, fontFamily: "sans-serif" }}>
        A
      </text>
      <text x="17" y="14" style={{ fontSize: "14px", fontWeight: 800, fontFamily: "sans-serif" }}>
        −
      </text>
    </Ic>
  ),
  star: (p) => (
    <Ic {...p}>
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill={p?.fc || C.accent}
        stroke="none"
      />
    </Ic>
  ),
  sparkle: (p) => (
    <Ic size={16} {...p} strokeWidth="0" fill={p?.fc || C.accent}>
      <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41z" />
    </Ic>
  ),
  eye: (p) => (
    <Ic {...p}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </Ic>
  ),
  eyeOff: (p) => (
    <Ic {...p}>
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </Ic>
  ),
  pencil: (p) => (
    <Ic {...p}>
      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </Ic>
  ),
  save: (p) => (
    <Ic {...p}>
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </Ic>
  ),
  chevDown: (p) => (
    <Ic {...p}>
      <polyline points="6 9 12 15 18 9" />
    </Ic>
  ),
};
