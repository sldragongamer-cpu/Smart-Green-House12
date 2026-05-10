import { NextResponse } from "next/server";

let latestData = { temperature: 0, humidity: 0 };

export async function POST(request: Request) {
  const data = await request.json();
  latestData = data;
  return NextResponse.json({ status: "ok" });
}

export async function GET() {
  return NextResponse.json(latestData);
}
