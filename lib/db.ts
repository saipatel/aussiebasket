import fs from "fs";
import path from "path";
import { Receipt } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "receipts.json");

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "[]", "utf8");
}

export function getReceipts(): Receipt[] {
  ensure();
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as Receipt[];
  } catch {
    return [];
  }
}

export function getReceipt(id: string): Receipt | undefined {
  return getReceipts().find((r) => r.id === id);
}

export function saveReceipt(r: Receipt) {
  ensure();
  const all = getReceipts();
  all.unshift(r);
  fs.writeFileSync(FILE, JSON.stringify(all, null, 2), "utf8");
}

export function deleteReceipt(id: string) {
  ensure();
  const all = getReceipts().filter((r) => r.id !== id);
  fs.writeFileSync(FILE, JSON.stringify(all, null, 2), "utf8");
}
