import type { SVGProps } from "react";

const PATHS = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  map: "M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  sprout: "M12 21v-9M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 10c0-4 3-6 7-6 0 4-3 6-7 6z",
  cycle: "M20 12a8 8 0 0 1-14.3 4.9M4 12A8 8 0 0 1 18.3 7.1M18 3v4.5h-4.5M6 21v-4.5h4.5",
  clipboard: "M9 4h6v3H9zM9 5.5H6a1 1 0 0 0-1 1V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6.5a1 1 0 0 0-1-1h-3M9 12h6M9 16h6",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
  flask: "M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3M7 15h10",
  check: "M5 12.5 10 17.5 19 7",
  x: "M6 6l12 12M18 6 6 18",
  alert: "M12 4 2.5 20h19zM12 10v4.5M12 17.5v.01",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5v.01",
  plus: "M12 5v14M5 12h14",
  chev: "M9 6l6 6-6 6",
  back: "M15 6l-6 6 6 6",
  calendar: "M4 6h16v15H4zM4 10h16M8 3v4M16 3v4",
  expand: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
  layers: "M12 3 2 8.5 12 14l10-5.5zM2 13l10 5.5L22 13",
  leaf: "M5 19c0-8 5-14 15-15-1 10-7 15-15 15zM5 19l7-7",
  drop: "M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z",
  thermo: "M10 14.5V5a2 2 0 1 1 4 0v9.5a4 4 0 1 1-4 0zM12 9v7",
  mountain: "M2 20 9 8l4 6 3-4 6 10z",
  slope: "M3 20h18L3 8zM3 14h6",
  ph: "M4 7h16M4 12h16M4 17h16M9 5v4M15 10v4M9 15v4",
  soil: "M3 9h18M3 14h18M3 19h18M7 4l2 2M12 4v2M17 4l-2 2",
  signal: "M5 20c0-8 6-14 14-14M5 20c0-4 3-8 8-8M5 20v.01",
  dash: "M6 12h12",
  assistant: "M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9l-5 4v-4H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8.5 13c0-3 2-5 6.5-5 0 3-2 5-6.5 5zM8.5 13l3.5-2.5",
  send: "M4 12 20 4l-6 16-2.5-6.5zM11.5 13.5 20 4",
  chat: "M4 5h16v11H9l-5 4z",
  shield: "M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6zM9 12l2 2 4-4",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
} as const;

export type Icon = keyof typeof PATHS;

export function Icon({ name, size = 24, ...props }: { name: Icon; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
