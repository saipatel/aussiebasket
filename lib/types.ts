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
