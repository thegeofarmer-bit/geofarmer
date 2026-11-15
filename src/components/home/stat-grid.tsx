function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="card min-w-0 p-5">
      <p className="text-sm font-bold tracking-[0.12em] text-muted uppercase">{label}</p>
      <p className="mt-1 text-4xl font-extrabold tracking-tight break-words sm:text-5xl">
        {value}
        {unit && <span className="ml-1.5 text-xl font-bold text-muted sm:text-2xl">{unit}</span>}
      </p>
    </div>
  );
}

export function StatGrid({
  mapped,
  total,
  areaHa,
  farmers,
  cropTypes,
}: {
  mapped: number;
  total: number;
  areaHa: number;
  farmers: number;
  cropTypes: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Stat label="Parcels" value={mapped.toLocaleString("en-GB")} />
      <Stat label="Area" value={Math.round(areaHa).toLocaleString("en-GB")} unit="ha" />
      <Stat label="Farmers" value={String(farmers)} />
      <Stat label="Crops" value={String(cropTypes)} unit="types" />
      {total > mapped && (
        <p className="col-span-2 text-sm text-muted">
          {total - mapped} more parcel records have no boundary yet and are not counted in area.
        </p>
      )}
    </div>
  );
}
