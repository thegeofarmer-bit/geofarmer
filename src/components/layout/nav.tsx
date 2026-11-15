"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { SimulatedBadge } from "@/components/ui/badges";

function navItems(pathname: string) {
  const parcel = pathname.match(/^\/parcel\/([^/]+)/)?.[1];
  const base = parcel ? `/parcel/${parcel}` : null;
  return {
    pathname,
    items: [
      { href: "/", label: "Home", icon: "home" as const, desktopIcon: "grid" as const, active: pathname === "/" },
      { href: "/map", label: "Map", icon: "map" as const, active: pathname === "/map" || (!!parcel && pathname === base) },
      {
        href: base ? `${base}/crops` : "/crops",
        label: "Crops",
        icon: "sprout" as const,
        active: pathname === "/crops" || pathname.endsWith("/crops"),
      },
      {
        href: base ? `${base}/rotation` : "/rotate",
        label: "Rotate",
        icon: "cycle" as const,
        active: pathname === "/rotate" || pathname.endsWith("/rotation"),
      },
      {
        href: "/farms",
        label: "Farms",
        icon: "clipboard" as const,
        active: pathname.startsWith("/farms") || pathname.endsWith("/record"),
      },
    ],
  };
}

export function BottomNav() {
  return <BottomNavView pathname={usePathname()} />;
}

export function BottomNavView({ pathname }: { pathname: string }) {
  const { items } = navItems(pathname);
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t-[1.5px] border-line-strong bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {items.map((it) => (
          <li key={it.label}>
            <Link
              href={it.href}
              aria-current={it.active ? "page" : undefined}
              className={`flex flex-col items-center gap-1 py-2.5 text-[13px] font-bold ${it.active ? "text-brand" : "text-ink"}`}
            >
              <span className={`flex h-9 w-16 items-center justify-center rounded-full ${it.active ? "bg-brand-soft" : ""}`}>
                <Icon name={it.icon} size={24} />
              </span>
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Sidebar() {
  return <SidebarView pathname={usePathname()} />;
}

export function SidebarView({ pathname }: { pathname: string }) {
  const { items } = navItems(pathname);
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r-[1.5px] border-line bg-surface px-5 py-7 lg:flex">
      <Link href="/" className="flex items-center gap-3 px-2">
        <Image src="/brand/geofarmer-mark.svg" alt="" width={36} height={36} />
        <span className="text-2xl font-extrabold tracking-tight">GeoFarmer</span>
      </Link>
      <ul className="mt-10 space-y-1.5">
        {items.map((it) => (
          <li key={it.label}>
            <Link
              href={it.href}
              aria-current={it.active ? "page" : undefined}
              className={`flex items-center gap-4 rounded-xl px-4 py-3 text-lg font-semibold ${
                it.active ? "bg-brand text-brand-ink" : "text-ink hover:bg-surface-2"
              }`}
            >
              <Icon name={it.desktopIcon ?? it.icon} size={24} />
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-auto space-y-3 px-1">
        <SimulatedBadge label="Prototype farm records" />
        <p className="text-sm text-muted">
          Farm parcels and farmers are demo data. Environmental layers are observed data (NASA SRTM, SoilGrids).
        </p>
      </div>
    </aside>
  );
}
