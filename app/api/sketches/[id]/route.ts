import { NextResponse } from "next/server";
import { getSketches, saveSketches } from "@/app/lib/store";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let sketches = getSketches();
  sketches = sketches.filter((s) => s.id !== id);
  saveSketches(sketches);
  return NextResponse.json({ status: "deleted" });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await request.json();
  const sketches = getSketches();
  const idx = sketches.findIndex((s) => s.id === id);
  if (idx === -1) return NextResponse.json({ error: "not found" }, { status: 404 });
  sketches[idx] = { ...sketches[idx], ...data, id, updated: new Date().toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric" }) };
  saveSketches(sketches);
  return NextResponse.json(sketches[idx]);
}
