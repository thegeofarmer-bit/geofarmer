import { Icon } from "./icon";

export function SimulatedBadge({ label = "Simulated record", className = "" }: { label?: string; className?: string }) {
  return (
    <span
      className={`hatch inline-flex items-center gap-1.5 rounded-full border-2 border-dashed border-warn-line px-3 py-1 text-sm font-bold text-warn-ink ${className}`}
    >
      <Icon name="flask" size={18} />
      {label}
    </span>
  );
}

export function ObservedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-info-line bg-info-bg px-3 py-0.5 text-sm font-bold text-info-ink">
      <Icon name="signal" size={16} />
      Observed
    </span>
  );
}

export function RelativeBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-dashed border-info-line bg-info-bg px-3 py-0.5 text-sm font-bold text-info-ink">
      <Icon name="layers" size={16} />
      Relative
    </span>
  );
}

export function NotAvailableBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-dotted border-line-strong bg-surface-2 px-3 py-0.5 text-sm font-bold text-muted">
      <Icon name="dash" size={16} />
      Not available
    </span>
  );
}
