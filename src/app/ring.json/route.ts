import { getNetworkManifest } from "@/data/network";

export async function GET() {
  return Response.json(getNetworkManifest(), {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
