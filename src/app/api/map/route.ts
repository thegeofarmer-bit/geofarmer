import { getMapData } from "@/lib/map-data";

export async function GET() {
  return Response.json(await getMapData(), {
    headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=86400" },
  });
}
