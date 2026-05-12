import { NextResponse } from "next/server";
import { getTriggers, saveTriggers, Trigger } from "@/app/lib/store";

export async function GET() {
  return NextResponse.json(getTriggers());
}

export async function POST(request: Request) {
  const data: Partial<Trigger> = await request.json();
  const triggers = getTriggers();
  const trigger: Trigger = {
    id: `t-${Date.now()}`,
    name: data.name || "",
    type: data.type || "Greater Than",
    variable: data.variable || "",
    threshold: data.threshold || "0",
    thing: data.thing || "",
    active: data.active ?? true,
    lastFired: "Never",
  };
  triggers.push(trigger);
  saveTriggers(triggers);
  return NextResponse.json(trigger, { status: 201 });
}
