import Link from "next/link";
import { FarmerForm } from "@/components/forms/farmer-form";
import { Icon } from "@/components/ui/icon";
import { getAllSeasons, getCrops, getFarmers, getParcels } from "@/lib/data";
import { FarmerCard } from "./farmer-card";
import { RecentSeasons } from "./recent-seasons";

export async function FarmsView() {
  const [farmers, parcels, seasons, crops] = await Promise.all([
    getFarmers(),
    getParcels(),
    getAllSeasons(),
    getCrops(),
  ]);
  const cropName = Object.fromEntries(crops.map((c) => [c.crop_id, c.crop_name]));
  const unassigned = parcels.filter((p) => !p.farmer_id && p.has_geometry).length;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <section className="space-y-4">
        <h2 className="text-2xl font-extrabold">Farmers and their parcels</h2>
        {farmers.map((f) => (
          <FarmerCard key={f.farmer_id} farmer={f} parcels={parcels.filter((p) => p.farmer_id === f.farmer_id)} />
        ))}
        <p className="text-muted">
          {unassigned} mapped parcels have no farmer yet.{" "}
          <Link href="/map" className="font-semibold text-brand underline">
            Open the map
          </Link>{" "}
          to pick one.
        </p>
        <div className="card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-xl font-bold">
            <Icon name="plus" size={22} /> Add a farmer
          </h3>
          <FarmerForm />
        </div>
      </section>
      <RecentSeasons seasons={seasons} cropName={cropName} />
    </div>
  );
}
