import { NextResponse } from "next/server";

let latestCommand = { command: "none" };

export async function POST(request: Request) {
  const data = await request.json();
  latestCommand = data;
  return NextResponse.json({ status: "ok" });
}

export async function GET() {
  return NextResponse.json(latestCommand);
}
