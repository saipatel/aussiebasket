export type Store = "Coles" | "Woolworths" | "ALDI" | "IGA";

export interface Product {
  id: string;
  name: string;
  category: string;
  size: string;
  prices: Record<Store, number>;
}

export interface ReceiptItem {
  productId: string;
  name: string;
  qty: number;
  pricePaid: number;
  cheapestStore: Store;
  cheapestPrice: number;
  saving: number;
  // Best current weekly special (if any) — beats the everyday cheapest
  specialStore?: Store;
  specialPrice?: number;
  specialLabel?: string;
  specialSaving?: number;
}

export interface Receipt {
  id: string;
  store: Store;
  date: string;
  total: number;
  cheapestTotal: number;
  totalSavings: number;
  items: ReceiptItem[];
  postcode?: string;
}

export interface NearbyStore {
  name: Store;
  distanceKm: number;
  address: string;
  openNow: boolean;
}

export type SpecialKind = "half-price" | "multi-buy" | "member" | "clearance";

export interface Special {
  id: string;
  productId: string;
  store: Store;
  kind: SpecialKind;
  // Effective per-unit price during the special
  salePrice: number;
  // Optional details for multi-buy: e.g., 2-for-$5
  multiBuy?: { qty: number; total: number };
  startDate: string; // ISO
  endDate: string;   // ISO
  label: string;     // human-readable, e.g. "½ Price"
}
