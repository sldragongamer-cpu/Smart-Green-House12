import { NextResponse } from "next/server";
import { getDevices, saveDevices } from "@/app/lib/store";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let devices = getDevices();
  devices = devices.filter((d) => d.id !== id);
  saveDevices(devices);
  return NextResponse.json({ status: "deleted" });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await request.json();
  const devices = getDevices();
  const idx = devices.findIndex((d) => d.id === id);
  if (idx === -1) return NextResponse.json({ error: "not found" }, { status: 404 });
  devices[idx] = { ...devices[idx], ...data, id };
  saveDevices(devices);
  return NextResponse.json(devices[idx]);
}
