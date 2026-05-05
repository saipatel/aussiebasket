import { Receipt, ReceiptItem, Store } from "./types";
import { findProduct, cheapestFor, PRODUCTS } from "./products";

const STORE_HINTS: Record<string, Store> = {
  coles: "Coles",
  woolworths: "Woolworths",
  woolies: "Woolworths",
  aldi: "ALDI",
  iga: "IGA",
};

export function detectStore(text: string): Store {
  const t = text.toLowerCase();
  for (const k of Object.keys(STORE_HINTS)) if (t.includes(k)) return STORE_HINTS[k];
  return "Coles";
}

// Parses lines like:
//   Milk 2L 3.40
//   2 x Eggs 6.50
//   Bread Loaf  $2.50
const LINE_RE = /^\s*(?:(\d+)\s*x\s*)?(.+?)\s*\$?(\d+\.\d{2})\s*$/i;

export function parseReceiptText(text: string): {
  store: Store;
  items: ReceiptItem[];
  total: number;
  cheapestTotal: number;
} {
  const store = detectStore(text);
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const items: ReceiptItem[] = [];

  for (const line of lines) {
    if (/^(total|subtotal|gst|change|tendered|eftpos|cash)/i.test(line)) continue;
    const m = line.match(LINE_RE);
    if (!m) continue;
    const qty = m[1] ? parseInt(m[1], 10) : 1;
    const name = m[2].trim();
    const pricePaid = parseFloat(m[3]);
    if (!name || isNaN(pricePaid)) continue;
    const product = findProduct(name);
    if (!product) continue;
    const cheapest = cheapestFor(product.id)!;
    const lineTotal = pricePaid;
    const cheapestLine = cheapest.price * qty;
    items.push({
      productId: product.id,
      name: product.name,
      qty,
      pricePaid: lineTotal,
      cheapestStore: cheapest.store,
      cheapestPrice: cheapest.price,
      saving: Math.max(0, lineTotal - cheapestLine),
    });
  }

  const total = items.reduce((s, i) => s + i.pricePaid, 0);
  const cheapestTotal = items.reduce((s, i) => s + i.cheapestPrice * i.qty, 0);
  return { store, items, total: round2(total), cheapestTotal: round2(cheapestTotal) };
}

// Sample receipt generator for demo when no real receipt provided
export function sampleReceiptText(store: Store = "Coles"): string {
  const picks = ["milk-2l","bread-white","eggs-12","bananas-1kg","chicken-breast","pasta-500g","cheese-block","butter-250g","apples-1kg","yogurt-1kg"];
  const lines: string[] = [`${store.toUpperCase()} Supermarket`, new Date().toLocaleString("en-AU"), ""];
  let total = 0;
  for (const id of picks) {
    const p = PRODUCTS.find((x) => x.id === id)!;
    const price = p.prices[store];
    lines.push(`${p.name}  $${price.toFixed(2)}`);
    total += price;
  }
  lines.push("", `TOTAL  $${total.toFixed(2)}`);
  return lines.join("\n");
}

function round2(n: number) { return Math.round(n * 100) / 100; }

export function buildReceipt(text: string, postcode?: string): Receipt {
  const parsed = parseReceiptText(text);
  return {
    id: `r_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    store: parsed.store,
    date: new Date().toISOString(),
    total: parsed.total,
    cheapestTotal: parsed.cheapestTotal,
    totalSavings: round2(parsed.total - parsed.cheapestTotal),
    items: parsed.items,
    postcode,
  };
}
