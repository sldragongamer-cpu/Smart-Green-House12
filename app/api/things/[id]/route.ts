import { NextResponse } from "next/server";
import { getThings, saveThings } from "@/app/lib/store";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let things = getThings();
  things = things.filter((t) => t.id !== id);
  saveThings(things);
  return NextResponse.json({ status: "deleted" });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await request.json();
  const things = getThings();
  const idx = things.findIndex((t) => t.id === id);
  if (idx === -1) return NextResponse.json({ error: "not found" }, { status: 404 });
  things[idx] = { ...things[idx], ...data, id, lastModified: new Date().toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) };
  saveThings(things);
  return NextResponse.json(things[idx]);
}
