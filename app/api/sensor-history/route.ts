import { NextResponse } from "next/server";
import { getSensorHistory } from "@/app/lib/store";

export async function GET() {
  return NextResponse.json(getSensorHistory());
}
