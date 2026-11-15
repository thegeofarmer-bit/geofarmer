"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useMapParams() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  return (next: Record<string, string | null>) => {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null) sp.delete(k);
      else sp.set(k, v);
    }
    startTransition(() => router.replace(`${pathname}?${sp.toString()}`, { scroll: false }));
  };
}
