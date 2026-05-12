import { NextResponse } from "next/server";
import { getWidgets, saveWidgets, getDashboards, saveDashboards, Widget } from "@/app/lib/store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json(getWidgets(id));
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await request.json();
  const widgets = getWidgets(id);
  const widget = {
    id: data.id || `w-${Date.now()}`,
    type: data.type || "temp",
    x: data.x ?? 0,
    y: data.y ?? 50,
    w: data.w ?? 4,
    h: data.h ?? 4,
    variable: data.variable,
  };
  widgets.push(widget);
  saveWidgets(id, widgets);

  // Update widget count on dashboard
  const dashboards = getDashboards();
  const dash = dashboards.find((d) => d.id === id);
  if (dash) {
    dash.widgetCount = widgets.length;
    saveDashboards(dashboards);
  }

  return NextResponse.json(widget, { status: 201 });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const updatedWidgets: Widget[] = await request.json();
  saveWidgets(id, updatedWidgets);

  const dashboards = getDashboards();
  const dash = dashboards.find((d) => d.id === id);
  if (dash) {
    dash.widgetCount = updatedWidgets.length;
    saveDashboards(dashboards);
  }

  return NextResponse.json(updatedWidgets);
}
