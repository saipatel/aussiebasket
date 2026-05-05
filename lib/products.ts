import { Product, Store } from "./types";

export const STORES: Store[] = ["Coles", "Woolworths", "ALDI", "IGA"];

export const PRODUCTS: Product[] = [
  { id: "milk-2l", name: "Full Cream Milk 2L", category: "Dairy", size: "2L",
    prices: { Coles: 3.40, Woolworths: 3.45, ALDI: 3.10, IGA: 3.80 } },
  { id: "bread-white", name: "White Bread Loaf", category: "Bakery", size: "700g",
    prices: { Coles: 2.50, Woolworths: 2.60, ALDI: 1.95, IGA: 3.20 } },
  { id: "eggs-12", name: "Free Range Eggs", category: "Dairy", size: "12 pack",
    prices: { Coles: 6.50, Woolworths: 6.30, ALDI: 5.49, IGA: 7.20 } },
  { id: "bananas-1kg", name: "Cavendish Bananas", category: "Produce", size: "1kg",
    prices: { Coles: 4.20, Woolworths: 4.20, ALDI: 3.99, IGA: 4.80 } },
  { id: "chicken-breast", name: "Chicken Breast Fillets", category: "Meat", size: "1kg",
    prices: { Coles: 13.50, Woolworths: 14.00, ALDI: 11.99, IGA: 15.00 } },
  { id: "rice-5kg", name: "Jasmine Rice", category: "Pantry", size: "5kg",
    prices: { Coles: 16.50, Woolworths: 17.00, ALDI: 13.99, IGA: 18.50 } },
  { id: "pasta-500g", name: "Spaghetti Pasta", category: "Pantry", size: "500g",
    prices: { Coles: 2.20, Woolworths: 2.30, ALDI: 1.49, IGA: 2.80 } },
  { id: "olive-oil-1l", name: "Extra Virgin Olive Oil", category: "Pantry", size: "1L",
    prices: { Coles: 11.50, Woolworths: 11.00, ALDI: 8.99, IGA: 13.50 } },
  { id: "tomatoes-1kg", name: "Roma Tomatoes", category: "Produce", size: "1kg",
    prices: { Coles: 4.50, Woolworths: 4.80, ALDI: 3.99, IGA: 5.50 } },
  { id: "cheese-block", name: "Tasty Cheese Block", category: "Dairy", size: "500g",
    prices: { Coles: 8.50, Woolworths: 8.20, ALDI: 6.99, IGA: 9.50 } },
  { id: "butter-250g", name: "Butter Unsalted", category: "Dairy", size: "250g",
    prices: { Coles: 5.50, Woolworths: 5.30, ALDI: 4.49, IGA: 6.00 } },
  { id: "coffee-1kg", name: "Ground Coffee Beans", category: "Pantry", size: "1kg",
    prices: { Coles: 22.00, Woolworths: 21.50, ALDI: 16.99, IGA: 24.00 } },
  { id: "yogurt-1kg", name: "Greek Yogurt", category: "Dairy", size: "1kg",
    prices: { Coles: 6.50, Woolworths: 6.20, ALDI: 4.99, IGA: 7.20 } },
  { id: "apples-1kg", name: "Pink Lady Apples", category: "Produce", size: "1kg",
    prices: { Coles: 5.50, Woolworths: 5.30, ALDI: 4.99, IGA: 6.20 } },
  { id: "potatoes-2kg", name: "Brushed Potatoes", category: "Produce", size: "2kg",
    prices: { Coles: 6.00, Woolworths: 6.20, ALDI: 4.99, IGA: 6.80 } },
  { id: "mince-beef", name: "Beef Mince", category: "Meat", size: "500g",
    prices: { Coles: 8.50, Woolworths: 8.30, ALDI: 7.49, IGA: 9.20 } },
  { id: "salmon-fillet", name: "Salmon Fillets", category: "Meat", size: "300g",
    prices: { Coles: 13.00, Woolworths: 12.50, ALDI: 10.99, IGA: 14.50 } },
  { id: "cereal-corn", name: "Corn Flakes", category: "Pantry", size: "750g",
    prices: { Coles: 5.50, Woolworths: 5.30, ALDI: 3.99, IGA: 6.20 } },
  { id: "orange-juice", name: "Orange Juice", category: "Drinks", size: "2L",
    prices: { Coles: 5.50, Woolworths: 5.20, ALDI: 4.49, IGA: 6.20 } },
  { id: "toilet-paper-12", name: "Toilet Paper", category: "Household", size: "12 pack",
    prices: { Coles: 9.50, Woolworths: 9.20, ALDI: 7.99, IGA: 11.50 } },
];

export function findProduct(name: string): Product | undefined {
  const n = name.toLowerCase().trim();
  let best: Product | undefined;
  let bestScore = 0;
  for (const p of PRODUCTS) {
    const pn = p.name.toLowerCase();
    let score = 0;
    if (pn === n) score = 100;
    else if (pn.includes(n) || n.includes(pn)) score = 60;
    else {
      const tokensA = n.split(/\s+/);
      const tokensB = pn.split(/\s+/);
      score = tokensA.filter((t) => tokensB.some((b) => b.includes(t) || t.includes(b))).length * 10;
    }
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  return bestScore >= 10 ? best : undefined;
}

export function cheapestFor(productId: string) {
  const p = PRODUCTS.find((x) => x.id === productId);
  if (!p) return null;
  let store: Store = "Coles";
  let price = Infinity;
  for (const s of STORES) {
    if (p.prices[s] < price) {
      price = p.prices[s];
      store = s;
    }
  }
  return { store, price };
}
