# Changelog

All notable changes to AussieBasket will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.4.0] — 2026-05-06

### Added
- **PDF e-receipt parsing** via `pdfjs-dist` (client-side)
  - Extracts text directly from emailed PDF receipts (Coles/Woolies digital receipts)
  - Reconstructs lines by Y-position so prices stay aligned with item names
  - Per-page progress indicator
  - Worker loaded from CDN (no bundle bloat)
- **Cloud OCR fallback** via OCR.space API
  - New `POST /api/ocr` server route (uses `OCR_SPACE_KEY` env var, falls back to public demo key)
  - "Cloud OCR" button surfaces in the scanner card after a local scan
  - Auto-suggested when local Tesseract returns very few lines
  - Re-scan button to retry locally
- `.env.example` documenting `OCR_SPACE_KEY`

### Changed
- `ReceiptScanner` accepts JPG/PNG **and** PDF in one dropzone
- Upload page tips updated for PDF + cloud fallback workflow

---

## [0.3.0] — 2026-05-06

### Added
- **In-browser receipt OCR** powered by `tesseract.js`
  - New `ReceiptScanner` component on `/upload`
  - Drag-drop, file picker, and "Use camera" (mobile) entry points
  - Live progress bar + status indicator while scanning
  - Image preview thumbnail
  - Extracted text appended to the editable textarea so users can fix mistakes before analysing
  - Runs entirely client-side — photos never leave the device

### Changed
- `/upload` page restructured with OCR-first UX (scan → review → analyse)
- Tips sidebar updated for OCR best practices
- README, features.md, implementation.md updated for OCR

---

## [0.2.0] — 2026-05-06 — MVP

### Added
- Next.js 14 App Router scaffolding (TypeScript + Tailwind)
- Mock Aussie supermarket price database with 20 staple products across Coles, Woolworths, ALDI, IGA
- Receipt parser (`lib/parser.ts`) — extracts items, qty, price from pasted text; auto-detects store
- File-based JSON storage for receipts (`lib/db.ts`)
- API routes:
  - `POST /api/receipts` — upload + parse + save
  - `GET /api/receipts` — list
  - `GET /api/receipts/[id]` — detail
  - `DELETE /api/receipts/[id]` — remove
  - `GET /api/compare` — search products
  - `POST /api/compare` — basket → cheapest store
  - `GET /api/nearby?postcode=` — nearby store lookup
- Pages:
  - `/` — landing with value prop
  - `/dashboard` — savings stats + receipt history
  - `/upload` — paste / drop / sample receipt
  - `/receipts/[id]` — item-by-item comparison + whole-basket per-store totals
  - `/compare` — catalogue search + smart basket builder
  - `/nearby` — postcode-based store finder
- Brand-themed UI with Tailwind, custom palette, reusable card/stat/badge components

### Changed
- README rewritten with MVP feature list, quickstart, structure, roadmap
- features.md and implementation.md updated to reflect MVP

---

## [0.1.0] — 2026-05-05

### Added
- Repository initialised
- README, CHANGELOG, feature docs, and implementation docs created
