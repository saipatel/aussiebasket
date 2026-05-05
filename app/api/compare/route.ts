import { NextRequest, NextResponse } from "next/server";
import { PRODUCTS, STORES, findProduct } from "@/lib/products";
import { Store } from "@/lib/types";

// GET /api/compare?q=milk  → returns matching products with all store prices
// GET /api/compare         → returns all
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase().trim();
  const list = q ? PRODUCTS.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) : PRODUCTS;
  return NextResponse.json(list);
}

// POST /api/compare  body: { items: [{ name, qty }] } → cheapest store for full basket
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const items: Array<{ name: string; qty?: number }> = body.items ?? [];
  if (!Array.isArray(items) || items.length === 0)
    return NextResponse.json({ error: "items required" }, { status: 400 });

  const totals: Record<Store, number> = { Coles: 0, Woolworths: 0, ALDI: 0, IGA: 0 };
  const matched: Array<{
    name: string;
    qty: number;
    matched: boolean;
    productId?: string;
    productName?: string;
    perStore?: Record<Store, number>;
  }> = [];

  for (const it of items) {
    const qty = it.qty ?? 1;
    const product = findProduct(it.name);
    if (!product) {
      matched.push({ name: it.name, qty, matched: false });
      continue;
    }
    for (const s of STORES) totals[s] += product.prices[s] * qty;
    matched.push({
      name: it.name, qty, matched: true,
      productId: product.id, productName: product.name,
      perStore: product.prices,
    });
  }

  let cheapest: Store = "Coles";
  for (const s of STORES) if (totals[s] < totals[cheapest]) cheapest = s;
  const dearest = STORES.reduce((a, b) => (totals[a] > totals[b] ? a : b), STORES[0]);

  return NextResponse.json({
    items: matched,
    totals,
    cheapestStore: cheapest,
    cheapestTotal: round2(totals[cheapest]),
    maxSaving: round2(totals[dearest] - totals[cheapest]),
  });
}

function round2(n: number) { return Math.round(n * 100) / 100; }
