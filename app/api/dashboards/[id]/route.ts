import { NextResponse } from "next/server";
import { getDashboards, saveDashboards } from "@/app/lib/store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dashboards = getDashboards();
  const dash = dashboards.find((d) => d.id === id);
  if (!dash) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(dash);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let dashboards = getDashboards();
  dashboards = dashboards.filter((d) => d.id !== id);
  saveDashboards(dashboards);
  return NextResponse.json({ status: "deleted" });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await request.json();
  const dashboards = getDashboards();
  const idx = dashboards.findIndex((d) => d.id === id);
  if (idx === -1) return NextResponse.json({ error: "not found" }, { status: 404 });
  dashboards[idx] = { ...dashboards[idx], ...data, id };
  saveDashboards(dashboards);
  return NextResponse.json(dashboards[idx]);
}
