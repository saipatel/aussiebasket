import { NextResponse } from "next/server";
import { getReceipt, deleteReceipt } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const r = getReceipt(params.id);
  if (!r) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(r);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  deleteReceipt(params.id);
  return NextResponse.json({ ok: true });
}
