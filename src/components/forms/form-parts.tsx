import type { FormState } from "@/actions/form-state";

export const field = "w-full rounded-2xl border-2 border-line-strong bg-surface px-5 py-4 text-xl outline-none focus:border-info-line";
export const label = "mb-2 block text-xl font-bold";

export function addDays(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function Status({ state }: { state: FormState }) {
  if (!state) return null;
  return (
    <p role="status" className={`font-semibold ${state.error ? "text-bad" : "text-brand"}`}>
      {state.error ?? state.ok}
    </p>
  );
}

export function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand py-5 text-xl font-bold text-brand-ink disabled:opacity-60"
    >
      {pending ? "Saving…" : children}
    </button>
  );
}
