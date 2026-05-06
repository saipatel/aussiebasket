import { Receipt, ReceiptItem, Store } from "./types";
import { findProduct, cheapestFor, PRODUCTS } from "./products";
import { specialFor } from "./specials";

const STORE_HINTS: Record<string, Store> = {
  coles: "Coles",
  woolworths: "Woolworths",
  woolies: "Woolworths",
  "ww metro": "Woolworths",
  aldi: "ALDI",
  iga: "IGA",
};

export function detectStore(text: string): Store {
  const t = text.toLowerCase();
  for (const k of Object.keys(STORE_HINTS)) if (t.includes(k)) return STORE_HINTS[k];
  return "Coles";
}

// Common Aussie receipt abbreviations & noise tokens
const ABBREV: Record<string, string> = {
  fc: "full cream",
  ls: "low fat",
  hl: "low fat",
  ww: "",
  wbk: "",
  col: "",
  smith: "",
  hm: "",
  brd: "bread",
  mlk: "milk",
  yog: "yogurt",
  yoghurt: "yogurt",
  yghrt: "yogurt",
  chs: "cheese",
  chkn: "chicken",
  brst: "breast",
  fillet: "fillets",
  pst: "pasta",
  spag: "spaghetti",
  tom: "tomato",
  toms: "tomatoes",
  ban: "banana",
  app: "apple",
  pot: "potato",
  pots: "potatoes",
  oj: "orange juice",
  cof: "coffee",
  coff: "coffee",
  egg: "eggs",
  eg: "eggs",
  butt: "butter",
  oil: "oil",
  oliv: "olive",
  rce: "rice",
  cer: "cereal",
  cf: "corn flakes",
  tp: "toilet paper",
  beef: "beef mince",
  mince: "mince",
  salm: "salmon",
};

const SKIP = /^(total|sub-?total|gst|change|tendered|eftpos|cash|card|visa|mc|amex|paypass|tax|round|amt|amount|balance|approved|refund|return|tender|payment|item count|items?|qty)\b/i;

// Parses lines after extensive normalisation. Examples handled:
//   "Milk 2L 3.40"
//   "FC MILK 2L              $3.40"
//   "1234 567890 EGGS FREE RANGE 12  6.50 EA"
//   "2 X CAVENDISH BANANAS  4.20"
//   "Bread Loaf  $2,50"  (some printers use comma)
const LINE_RE = /^(?:(\d+)\s*[xX*]\s*)?(.+?)[\s.\-]*\$?(\d+[.,]\d{1,2})\s*(?:ea|each|kg|g|ml|l)?\s*$/i;

function normaliseLine(raw: string): string {
  let s = raw.trim();
  // Strip leading SKU/barcode digits (5+ digits at start)
  s = s.replace(/^\d{5,}\s+/, "");
  // Strip leading shelf-tag like "1.50/kg"
  s = s.replace(/^\d+\.\d+\s*\/\s*\w+\s+/i, "");
  // Replace tab and multi-space with single space
  s = s.replace(/[\t ]+/g, " ").replace(/ {2,}/g, " ");
  // Replace common OCR confusions in the price area: O→0, l→1 around digits
  s = s.replace(/(\d)[Oo](\d)/g, "$1" + "0" + "$2").replace(/(\d)[lI](\d)/g, "$1" + "1" + "$2");
  return s;
}

function expandAbbrev(name: string): string {
  const tokens = name.split(/\s+/).map((t) => t.replace(/[^a-zA-Z0-9]/g, "").toLowerCase());
  const expanded: string[] = [];
  for (const t of tokens) {
    if (!t) continue;
    if (ABBREV[t] !== undefined) {
      if (ABBREV[t]) expanded.push(ABBREV[t]);
    } else {
      expanded.push(t);
    }
  }
  return expanded.join(" ");
}

export function parseReceiptText(text: string): {
  store: Store;
  items: ReceiptItem[];
  total: number;
  cheapestTotal: number;
  unmatched: string[];
  rawLines: number;
} {
  const store = detectStore(text);
  const lines = text.split(/\r?\n/).map(normaliseLine).filter(Boolean);
  const items: ReceiptItem[] = [];
  const unmatched: string[] = [];

  for (const line of lines) {
    if (SKIP.test(line)) continue;
    const m = line.match(LINE_RE);
    if (!m) continue;
    const qty = m[1] ? parseInt(m[1], 10) : 1;
    const rawName = m[2].trim();
    const priceStr = m[3].replace(",", ".");
    const pricePaid = parseFloat(priceStr);
    if (!rawName || isNaN(pricePaid) || pricePaid <= 0) continue;
    if (rawName.length < 2) continue;

    // Try original, then abbreviation-expanded
    let product = findProduct(rawName);
    if (!product) product = findProduct(expandAbbrev(rawName));
    if (!product) {
      unmatched.push(`${rawName} — $${pricePaid.toFixed(2)}`);
      continue;
    }

    const cheapest = cheapestFor(product.id)!;
    const lineTotal = pricePaid;
    const cheapestLine = cheapest.price * qty;
    const sp = specialFor(product.id);
    const specialLine = sp ? sp.salePrice * qty : Infinity;
    const beatsCheapest = sp && specialLine < cheapestLine;

    items.push({
      productId: product.id,
      name: product.name,
      qty,
      pricePaid: lineTotal,
      cheapestStore: cheapest.store,
      cheapestPrice: cheapest.price,
      saving: Math.max(0, lineTotal - cheapestLine),
      ...(beatsCheapest && sp
        ? {
            specialStore: sp.store,
            specialPrice: sp.salePrice,
            specialLabel: sp.label,
            specialSaving: round2(lineTotal - specialLine),
          }
        : {}),
    });
  }

  const total = items.reduce((s, i) => s + i.pricePaid, 0);
  const cheapestTotal = items.reduce((s, i) => s + i.cheapestPrice * i.qty, 0);
  return {
    store,
    items,
    total: round2(total),
    cheapestTotal: round2(cheapestTotal),
    unmatched,
    rawLines: lines.length,
  };
}

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

export function buildReceipt(text: string, postcode?: string): Receipt & { unmatched: string[]; rawLines: number } {
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
    unmatched: parsed.unmatched,
    rawLines: parsed.rawLines,
  } as any;
}
