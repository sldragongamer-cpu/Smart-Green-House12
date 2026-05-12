import { NextResponse } from "next/server";
import { getSketches, saveSketches, Sketch } from "@/app/lib/store";

export async function GET() {
  return NextResponse.json(getSketches());
}

export async function POST(request: Request) {
  const data: Partial<Sketch> = await request.json();
  const sketches = getSketches();
  const sketch: Sketch = {
    id: `sk-${Date.now()}`,
    name: data.name || "untitled.ino",
    thing: data.thing || "",
    updated: new Date().toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    size: new Blob([data.content || ""]).size > 1024
      ? `${(new Blob([data.content || ""]).size / 1024).toFixed(1)} KB`
      : `${new Blob([data.content || ""]).size} B`,
    content: data.content || "",
  };
  sketches.push(sketch);
  saveSketches(sketches);
  return NextResponse.json(sketch, { status: 201 });
}
