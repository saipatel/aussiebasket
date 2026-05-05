# Implementation Documentation

Architecture, data flow, and engineering decisions for AussieBasket.

---

## Stack (current)

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + custom brand palette |
| Icons | lucide-react |
| OCR | tesseract.js (client-side, dynamic import) |
| Storage | File-based JSON (`data/receipts.json`) — MVP |
| Server | Next.js API routes (Node runtime) |

Future targets: Postgres + Drizzle, NextAuth, Tesseract for OCR, real price feeds.

---

## Architecture

```
┌─────────────────────────┐
│  Browser (React/Next)   │
│  /, /dashboard, /upload │
│  /receipts/:id, /compare│
│  /nearby                │
└─────────┬───────────────┘
          │ fetch
          ▼
┌─────────────────────────┐
│  Next.js API routes     │
│  /api/receipts          │
│  /api/receipts/[id]     │
│  /api/compare           │
│  /api/nearby            │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  lib/                   │
│  parser → products → db │
│  nearby                 │
└─────────────────────────┘
```

---

## Data model

### `Product` (static, from `lib/products.ts`)
```ts
{
  id: string;
  name: string;
  category: string;
  size: string;
  prices: { Coles: number; Woolworths: number; ALDI: number; IGA: number; }
}
```

### `Receipt`
```ts
{
  id: string;          // r_<ts>_<rand>
  store: Store;        // detected from receipt header
  date: string;        // ISO
  total: number;       // sum of pricePaid
  cheapestTotal: number; // sum of cheapest equivalents
  totalSavings: number;  // total - cheapestTotal
  items: ReceiptItem[];
  postcode?: string;
}
```

### `ReceiptItem`
```ts
{
  productId: string;
  name: string;        // canonical product name (post-match)
  qty: number;
  pricePaid: number;
  cheapestStore: Store;
  cheapestPrice: number; // per unit
  saving: number;        // pricePaid − cheapestPrice * qty
}
```

---

## OCR pipeline (v0.3.0)

`components/ReceiptScanner.tsx`

1. User drops/picks an image, or uses phone camera (`capture="environment"`).
2. We `await import("tesseract.js")` — keeps the ~2 MB worker bundle out of the main JS chunk.
3. `Tesseract.recognize(file, "eng", { logger })` runs the WASM worker entirely in the browser; `logger` updates a progress bar + status string (`loading core`, `recognizing text`, etc.).
4. Resulting text is **appended** to the existing textarea (so multi-page receipts can be stitched together) and the user can edit before submitting.
5. From there the standard text-parsing pipeline (below) takes over.

**Privacy:** images never hit the server. **Trade-off:** initial scan downloads the eng traineddata (~10 MB cached after first run); cloud OCR fallback is on the roadmap for low-quality photos.

---

## Receipt parsing pipeline

`lib/parser.ts → parseReceiptText`

1. Detect store via header keyword match (`coles | woolies | aldi | iga`).
2. Split into lines, strip blank.
3. Drop header/footer noise (`TOTAL`, `GST`, `EFTPOS`, `CHANGE`, `TENDERED`, `CASH`).
4. For each remaining line, regex `^(\d+ x )?<name> $?<dd.dd>$`.
5. Fuzzy-match the name against `PRODUCTS` via `findProduct`:
   - Exact match → score 100
   - Substring either direction → 60
   - Token overlap → 10 per matching token
   - Threshold ≥ 10 to accept
6. Look up cheapest store/price for matched product.
7. Compute saving = `pricePaid − cheapestPrice × qty` (clamped ≥ 0).

Unmatched items are silently dropped in MVP. Future: surface them for manual mapping.

---

## Price comparison engine

`POST /api/compare` accepts `{ items: [{ name, qty }] }`:
- Matches each via `findProduct`.
- Sums per-store totals.
- Returns `cheapestStore`, `cheapestTotal`, `maxSaving` (cheapest vs dearest).

The `/compare` page calls `GET /api/compare` once for the catalogue, then computes basket totals client-side for instant UX.

---

## Nearby store lookup

`lib/nearby.ts` — deterministic mock based on postcode hash. Returns 4 stores (one per chain) with synthetic distance and open/closed status. Sorted ascending by distance. Replaces with real geo provider (Mapbox / Google Places) post-MVP.

---

## Storage

`lib/db.ts` reads/writes a single JSON file at `data/receipts.json`:
- `getReceipts()` — list (newest first; new uploads `unshift`)
- `getReceipt(id)`
- `saveReceipt(r)`
- `deleteReceipt(id)`

The file is **gitignored**; created lazily on first write. Trade-off: simple, zero-deps, but single-process only. Swap for Postgres + Drizzle when we add auth.

---

## UI conventions

- All pages live under `app/` using server components by default; client components are marked `"use client"` only where state/interaction requires.
- Reusable primitives in `components/` (Navbar, StatCard).
- Tailwind utility classes + a small set of `@layer components` shorthand: `.btn`, `.btn-primary`, `.btn-ghost`, `.card`, `.stat-card`, `.badge`, `.input`.
- Brand palette: emerald-based, `brand-50 → brand-900`.
- Currency formatted via `aud(n)` (always `$x.xx`).
- Dates via `fmtDate(iso)` in `en-AU` locale.

---

## Environment variables

None required for MVP. Future:

```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
OCR_API_KEY=
COLES_API_KEY=
WOOLIES_API_KEY=
```

---

## Key decisions

| Decision | Why |
|---|---|
| File-based JSON storage | Zero infra for MVP; swap-in path is isolated to `lib/db.ts`. |
| Mock price DB | Live scraping has legal/operational complexity; mock proves UX first. |
| Server components by default | Faster TTFB, less JS. Client components only for interactive pages (`/upload`, `/compare`, `/nearby`). |
| Fuzzy product matching | Receipts have inconsistent naming ("MILK 2L" vs "Full Cream Milk 2L"). |
| Tailwind + custom palette | Fast iteration; consistent theme without a heavy UI lib. |

---

## Update log

| Date       | Section             | Change                                              |
|------------|---------------------|-----------------------------------------------------|
| 2026-05-05 | All                 | Initial documentation created                       |
| 2026-05-06 | All                 | Rewritten to reflect MVP architecture & data model  |
| 2026-05-06 | OCR pipeline        | Added Tesseract.js client-side scanner              |
