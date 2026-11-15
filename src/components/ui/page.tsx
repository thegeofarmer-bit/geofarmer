import Link from "next/link";
import { Icon } from "./icon";

export function PageHeader({
  kicker,
  title,
  aside,
  back,
}: {
  kicker?: React.ReactNode;
  title: React.ReactNode;
  aside?: React.ReactNode;
  back?: string;
}) {
  return (
    <header className="mb-6 flex items-start justify-between gap-3">
      <div className="min-w-0">
        {back && (
          <Link href={back} className="mb-2 inline-flex items-center gap-1 font-semibold text-muted hover:text-ink">
            <Icon name="back" size={18} /> Back
          </Link>
        )}
        {kicker && <p className="text-lg font-semibold tracking-wide text-muted">{kicker}</p>}
        <h1 className="text-[2.6rem] leading-[1.05] font-extrabold tracking-tight sm:text-5xl">{title}</h1>
      </div>
      {aside && <div className="shrink-0 pt-1">{aside}</div>}
    </header>
  );
}

export function Page({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return <div className={`mx-auto w-full px-5 pt-8 sm:px-8 lg:pt-10 ${wide ? "max-w-6xl" : "max-w-2xl"}`}>{children}</div>;
}

export function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="card h-28 animate-pulse bg-surface-2" />
      ))}
    </div>
  );
}
