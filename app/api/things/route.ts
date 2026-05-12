import { NextResponse } from "next/server";
import { getThings, saveThings, Thing } from "@/app/lib/store";

export async function GET() {
  return NextResponse.json(getThings());
}

export async function POST(request: Request) {
  const data: Partial<Thing> = await request.json();
  const things = getThings();
  const thing: Thing = {
    id: `thing-${Date.now()}`,
    name: data.name || "",
    device: data.device || "",
    deviceId: data.deviceId || "",
    sketch: data.sketch || "",
    variables: data.variables || [],
    lastModified: new Date().toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
    created: new Date().toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
  };
  things.push(thing);
  saveThings(things);
  return NextResponse.json(thing, { status: 201 });
}
