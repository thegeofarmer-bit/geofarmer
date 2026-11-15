export interface EnvSummaryItem {
  label: string;
  unit: string;
  digits: number;
  values: Record<string, number>;
}

function average(values: Record<string, number>) {
  const v = Object.values(values);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

export function EnvironmentSummary({ items }: { items: EnvSummaryItem[] }) {
  return (
    <section className="card p-6">
      <h2 className="text-2xl font-extrabold">Environment across parcels</h2>
      <ul className="mt-4 grid grid-cols-3 gap-3">
        {items.map((e) => {
          const value = average(e.values);
          return (
            <li key={e.label}>
              <p className="text-sm font-semibold text-muted">{e.label}</p>
              <p className="font-mono text-2xl font-bold">
                {value == null
                  ? "—"
                  : value.toLocaleString("en-GB", { maximumFractionDigits: e.digits, minimumFractionDigits: e.digits })}
                <span className="ml-0.5 text-sm text-muted">{e.unit}</span>
              </p>
              <p className="text-xs text-muted">{Object.keys(e.values).length} parcels</p>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-sm text-muted">
        Soil pH, organic carbon and nitrogen are relative levels only. Rainfall, temperature and NDVI arrive once the GIS team supplies those layers.
      </p>
    </section>
  );
}
