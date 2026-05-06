import { NextRequest, NextResponse } from "next/server";
import { getCurrentSpecials } from "@/lib/specials";
import { PRODUCTS } from "@/lib/products";

export async function GET(req: NextRequest) {
  const store = req.nextUrl.searchParams.get("store");
  const kind = req.nextUrl.searchParams.get("kind");
  let list = getCurrentSpecials();
  if (store) list = list.filter((s) => s.store === store);
  if (kind) list = list.filter((s) => s.kind === kind);

  const enriched = list.map((s) => {
    const p = PRODUCTS.find((x) => x.id === s.productId)!;
    const everyday = Math.min(...Object.values(p.prices));
    return {
      ...s,
      product: p,
      everydayPrice: everyday,
      saving: Number((everyday - s.salePrice).toFixed(2)),
      savingPct: Math.max(0, Math.round(((everyday - s.salePrice) / everyday) * 100)),
    };
  });
  return NextResponse.json(enriched);
}
