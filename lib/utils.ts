import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function aud(n: number): string {
  return `$${n.toFixed(2)}`;
}

export function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
}
