const STYLE: Record<string, { color: string }> = {
  Maize: { color: "#E69F00" },
  Soybean: { color: "#009E73" },
  Yam: { color: "#0072B2" },
  Groundnut: { color: "#D55E00" },
  Cassava: { color: "#56B4E9" },
  Cowpea: { color: "#CC79A7" },
  Rice: { color: "#B8A43A" },
};

export const NO_CROP_COLOR = "#B9AE9A";

export function cropColor(name: string | null | undefined): string {
  return (name && STYLE[name]?.color) || NO_CROP_COLOR;
}


export function cropLetter(name: string | null | undefined): string {
  return name ? name[0].toUpperCase() : "–";
}
