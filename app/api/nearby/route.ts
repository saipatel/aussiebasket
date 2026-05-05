import { NextRequest, NextResponse } from "next/server";
import { findNearbyStores } from "@/lib/nearby";

export async function GET(req: NextRequest) {
  const postcode = req.nextUrl.searchParams.get("postcode") || "2000";
  return NextResponse.json(findNearbyStores(postcode));
}
