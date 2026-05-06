import { PRODUCTS } from "./products";
import { Special, Store } from "./types";

// Returns Mon-Sun window covering today.
function currentWeekWindow(now = new Date()) {
  const d = new Date(now);
  const day = (d.getDay() + 6) % 7; // Mon=0
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// Deterministic weekly specials seeded from the ISO week — so the same
// week always shows the same deals, but they rotate week-to-week.
function weekSeed(d = new Date()): number {
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const days = Math.floor((d.getTime() - start.getTime()) / 86400000);
  return Math.floor(days / 7);
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 0xffffffff;
}

const STORE_BIAS: Record<Store, number> = { Coles: 0.32, Woolworths: 0.32, ALDI: 0.18, IGA: 0.18 };

export function getCurrentSpecials(now = new Date()): Special[] {
  const { start, end } = currentWeekWindow(now);
  const seed = weekSeed(now);
  const r = rng(seed);
  const specials: Special[] = [];

  // Pick ~12 specials per week across the catalogue
  const picks = new Set<string>();
  while (picks.size < Math.min(12, PRODUCTS.length)) {
    picks.add(PRODUCTS[Math.floor(r() * PRODUCTS.length)].id);
  }

  for (const id of picks) {
    const p = PRODUCTS.find((x) => x.id === id)!;
    // Pick a store, weighted
    const roll = r();
    let acc = 0;
    let store: Store = "Coles";
    for (const s of Object.keys(STORE_BIAS) as Store[]) {
      acc += STORE_BIAS[s];
      if (roll <= acc) { store = s; break; }
    }
    const base = p.prices[store];

    const kindRoll = r();
    let kind: Special["kind"];
    let salePrice = base;
    let multiBuy: Special["multiBuy"] | undefined;
    let label = "";

    if (kindRoll < 0.5) {
      kind = "half-price";
      salePrice = round2(base * 0.5);
      label = "½ Price";
    } else if (kindRoll < 0.75) {
      kind = "multi-buy";
      const qty = 2;
      const total = round2(base * 2 * 0.7); // 30% off when buying 2
      multiBuy = { qty, total };
      salePrice = round2(total / qty);
      label = `${qty} for $${total.toFixed(2)}`;
    } else if (kindRoll < 0.9) {
      kind = "member";
      salePrice = round2(base * 0.75);
      label = "Member offer";
    } else {
      kind = "clearance";
      salePrice = round2(base * 0.6);
      label = "Clearance";
    }

    specials.push({
      id: `sp_${seed}_${id}_${store}`,
      productId: id,
      store,
      kind,
      salePrice,
      multiBuy,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      label,
    });
  }

  return specials.sort((a, b) => a.salePrice - b.salePrice);
}

export function specialFor(productId: string, now = new Date()): Special | undefined {
  return getCurrentSpecials(now).find((s) => s.productId === productId);
}

function round2(n: number) { return Math.round(n * 100) / 100; }
