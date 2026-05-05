import { NearbyStore, Store } from "./types";
import { STORES } from "./products";

// Mock nearby stores by postcode hash — for MVP demo only
export function findNearbyStores(postcode: string): NearbyStore[] {
  const seed = parseInt(postcode || "2000", 10) || 2000;
  const addresses: Record<Store, string> = {
    Coles: `${(seed % 200) + 1} George St`,
    Woolworths: `${(seed % 150) + 5} King St`,
    ALDI: `${(seed % 90) + 12} Market St`,
    IGA: `${(seed % 60) + 3} Pitt St`,
  };
  return STORES.map((s, i) => ({
    name: s,
    distanceKm: Number((((seed + i * 17) % 50) / 10 + 0.4).toFixed(1)),
    address: `${addresses[s]}, ${postcode || "2000"}`,
    openNow: ((seed + i) % 5) !== 0,
  })).sort((a, b) => a.distanceKm - b.distanceKm);
}
