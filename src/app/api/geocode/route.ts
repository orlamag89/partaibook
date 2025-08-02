import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${process.env.MAPBOX_TOKEN}&limit=1`
    );
    const data = await response.json();
    const [longitude, latitude] = data.features[0]?.center || [0, 0];
    return NextResponse.json({ longitude, latitude });
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json({ error: "Failed to geocode address" }, { status: 500 });
  }
}