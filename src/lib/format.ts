export function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatHectares(ha: number | string | null): string | null {
  if (ha == null) return null;
  return `${Number(ha).toLocaleString("en-GB", { maximumFractionDigits: 1 })} ha`;
}
