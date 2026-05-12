import { NextResponse } from "next/server";
import { getTriggers, saveTriggers } from "@/app/lib/store";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let triggers = getTriggers();
  triggers = triggers.filter((t) => t.id !== id);
  saveTriggers(triggers);
  return NextResponse.json({ status: "deleted" });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await request.json();
  const triggers = getTriggers();
  const idx = triggers.findIndex((t) => t.id === id);
  if (idx === -1) return NextResponse.json({ error: "not found" }, { status: 404 });
  triggers[idx] = { ...triggers[idx], ...data, id };
  saveTriggers(triggers);
  return NextResponse.json(triggers[idx]);
}
