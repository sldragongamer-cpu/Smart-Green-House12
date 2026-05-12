import { NextResponse } from "next/server";
import { getLatestSensor, saveSensorData } from "@/app/lib/store";

export async function POST(request: Request) {
  const data = await request.json();
  const updates: Record<string, any> = {};
  if (data.light !== undefined) updates.light = data.light;
  if (data.fan !== undefined) updates.fan = data.fan;
  saveSensorData(updates);
  return NextResponse.json({ status: "ok", ...updates });
}

export async function GET() {
  const latest = getLatestSensor();
  return NextResponse.json({ light: latest.light, fan: latest.fan });
}
