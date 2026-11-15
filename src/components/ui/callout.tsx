import { Icon, type Icon as IconName } from "./icon";

export function Callout({
  tone,
  icon,
  children,
}: {
  tone: "warn" | "info";
  icon: IconName;
  children: React.ReactNode;
}) {
  const cls = tone === "warn" ? "border-warn-line bg-warn-bg" : "border-info-line bg-info-bg";
  const ink = tone === "warn" ? "text-warn-ink" : "text-info-ink";
  return (
    <div className={`flex gap-3 rounded-2xl border-[1.5px] p-4 ${cls}`}>
      <Icon name={icon} size={26} className={`mt-0.5 shrink-0 ${ink}`} />
      <div className="text-[15px] leading-snug text-ink">{children}</div>
    </div>
  );
}
