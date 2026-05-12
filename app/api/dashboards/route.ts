import { NextResponse } from "next/server";
import { getDashboards, saveDashboards, Dashboard } from "@/app/lib/store";

export async function GET() {
  return NextResponse.json(getDashboards());
}

export async function POST(request: Request) {
  const data: Partial<Dashboard> = await request.json();
  const dashboards = getDashboards();
  const colors = ["#00979d", "#2ecc71", "#e74c3c", "#f39c12", "#9b59b6"];
  const dash: Dashboard = {
    id: `dash-${Date.now()}`,
    name: data.name || "",
    type: "Custom",
    device: data.device || "—",
    thingId: data.thingId || "",
    thingName: data.thingName || "",
    lastOpened: new Date().toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
    created: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    coverColor: colors[Math.floor(Math.random() * colors.length)],
    icon: "LayoutDashboard",
    widgetCount: 0,
  };
  dashboards.unshift(dash);
  saveDashboards(dashboards);
  return NextResponse.json(dash, { status: 201 });
}
