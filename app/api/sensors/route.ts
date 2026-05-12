import { NextResponse } from "next/server";
import { getLatestSensor, saveSensorData } from "@/app/lib/store";

export async function POST(request: Request) {
  const data = await request.json();
  const updated = saveSensorData(data);
  return NextResponse.json(updated);
}

export async function GET() {
  return NextResponse.json(getLatestSensor());
}
