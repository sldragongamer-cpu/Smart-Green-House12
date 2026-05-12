import { NextResponse } from "next/server";
import { getDevices, saveDevices, Device } from "@/app/lib/store";

export async function GET() {
  return NextResponse.json(getDevices());
}

export async function POST(request: Request) {
  const data: Partial<Device> = await request.json();
  const devices = getDevices();
  const device: Device = {
    id: `dev-${Date.now()}`,
    name: data.name || "",
    type: data.type || "ESP32",
    status: "offline",
    lastSeen: "Just now",
    ip: "—",
    thing: data.thing || "—",
    autoRegistered: data.autoRegistered || false,
  };
  devices.push(device);
  saveDevices(devices);
  return NextResponse.json(device, { status: 201 });
}
