"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.css";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
} from "chart.js";
import {
  Plus,
  ArrowLeft,
  X,
  GripVertical,
  Trash2,
  Thermometer,
  Droplets,
  Fan,
  Lightbulb,
  Waves,
  Eye,
  EyeOff,
} from "lucide-react";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

GridStack.renderCB = (el, w) => { if (el && w?.content) el.innerHTML = w.content; };

function rand(base: number, step = 2) {
  return Math.max(0, Math.min(100, base + (Math.random() - 0.5) * step));
}

type WidgetType = "temp" | "humidity" | "fan" | "light" | "water";

interface Widget {
  id: string;
  type: WidgetType;
}

interface Sensors {
  temperature: number;
  humidity: number;
  light: boolean;
  fan: number;
  water: number;
}

let nextId = 1;
function genId() {
  return `w${nextId++}`;
}

interface WidgetMeta {
  label: string;
  icon: React.ReactNode;
  iconEl: string;
  desc: string;
  defaultW: number;
  defaultH: number;
}

const WIDGET_META: Record<WidgetType, WidgetMeta> = {
  temp: {
    label: "Temperature", icon: <Thermometer size={18} />, iconEl: "🌡️",
    desc: "Real-time temperature with chart", defaultW: 4, defaultH: 4,
  },
  humidity: {
    label: "Humidity", icon: <Droplets size={18} />, iconEl: "💧",
    desc: "Real-time humidity with chart", defaultW: 4, defaultH: 4,
  },
  fan: {
    label: "Fan Speed", icon: <Fan size={18} />, iconEl: "🌀",
    desc: "Adjust fan speed with slider", defaultW: 3, defaultH: 3,
  },
  light: {
    label: "Light", icon: <Lightbulb size={18} />, iconEl: "💡",
    desc: "Toggle light on/off", defaultW: 2, defaultH: 2,
  },
  water: {
    label: "Water Level", icon: <Waves size={18} />, iconEl: "💦",
    desc: "Monitor water level", defaultW: 2, defaultH: 2,
  },
};

const DASHBOARD_NAMES: Record<string, string> = {
  "esp32-main": "ESP32",
  greenhouse: "Green House",
  "greenhouse-vars": "Green House Variables",
};

type PaletteTab = "widgets" | "variables";

export default function DashboardView() {
  const params = useParams();
  const router = useRouter();
  const gridRef = useRef<HTMLDivElement>(null);
  const grid = useRef<GridStack | null>(null);
  const chartInstances = useRef<Map<string, Chart>>(new Map());
  const chartStore = useRef<Map<string, { labels: string[]; data: number[] }>>(new Map());

  const [sensors, setSensors] = useState<Sensors>({ temperature: 24, humidity: 60, light: false, fan: 0, water: 45 });
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: genId(), type: "temp" },
    { id: genId(), type: "humidity" },
    { id: genId(), type: "water" },
    { id: genId(), type: "light" },
    { id: genId(), type: "fan" },
  ]);
  const [editMode, setEditMode] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [paletteTab, setPaletteTab] = useState<PaletteTab>("widgets");

  const id = typeof params.id === "string" ? params.id : "";
  const dashName = DASHBOARD_NAMES[id] || id;

  useEffect(() => {
    chartStore.current.set("temp", { labels: [], data: [] });
    chartStore.current.set("humidity", { labels: [], data: [] });
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setSensors((p) => ({
        temperature: Math.round(rand(p.temperature) * 10) / 10,
        humidity: Math.round(rand(p.humidity, 1.5) * 10) / 10,
        light: p.light,
        fan: p.fan,
        water: Math.round(Math.max(0, Math.min(100, p.water + (Math.random() - 0.5) * 3))),
      }));
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const time = new Date().toLocaleTimeString();
    (["temp", "humidity"] as const).forEach((k) => {
      const store = chartStore.current.get(k);
      if (!store) return;
      store.labels.push(time);
      store.data.push(k === "temp" ? sensors.temperature : sensors.humidity);
      if (store.labels.length > 20) { store.labels.shift(); store.data.shift(); }
      const chart = chartInstances.current.get(k);
      if (chart) {
        chart.data.labels = [...store.labels];
        chart.data.datasets[0].data = [...store.data];
        chart.update("none");
      }
    });
  }, [sensors]);

  useEffect(() => {
    if (!gridRef.current || grid.current) return;
    const g = GridStack.init({
      float: false,
      resizable: { handles: editMode ? "all" : "none" },
      draggable: { handle: ".grid-stack-item-content" },
      column: 12,
      cellHeight: 80,
      margin: 12,
      disableDrag: !editMode,
      disableResize: !editMode,
      alwaysShowResizeHandle: editMode,
    }, gridRef.current);
    grid.current = g;
    return () => { g.destroy(false); grid.current = null; };
  }, [editMode]);

  const syncWidgets = useCallback(() => {
    const g = grid.current;
    if (!g) return;
    const existing = new Set(g.getGridItems().map((el) => el.getAttribute("gs-id")));
    widgets.forEach((w) => {
      if (!existing.has(w.id)) {
        const meta = WIDGET_META[w.type];
        g.addWidget({ id: w.id, x: 0, y: 50, w: meta.defaultW, h: meta.defaultH });
      }
    });
  }, [widgets]);

  useEffect(() => { syncWidgets(); }, [syncWidgets]);

  useEffect(() => {
    widgets.forEach((w) => {
      const el = document.querySelector(`.grid-stack-item[gs-id="${w.id}"] .grid-stack-item-content`);
      if (!el) return;
      const meta = WIDGET_META[w.type];
      const removeBtn = editMode
        ? `<button class="widget-remove-btn" onclick="window.dispatchEvent(new CustomEvent('remove-widget',{detail:'${w.id}'}))"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg></button>`
        : "";
      const dragHandle = editMode
        ? `<div class="widget-drag-bar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg></div>`
        : "";
      el.innerHTML = renderWidget(w, sensors, meta, removeBtn, dragHandle);
    });
  }, [sensors, widgets, editMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      (["temp", "humidity"] as const).forEach((type) => {
        const canvas = document.getElementById(`chart-${type}`) as HTMLCanvasElement;
        if (!canvas || chartInstances.current.has(type)) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const isTemp = type === "temp";
        const chart = new Chart(ctx, {
          type: "line",
          data: { labels: [], datasets: [{ label: isTemp ? "Temperature °C" : "Humidity %", data: [], borderColor: isTemp ? "#e74c3c" : "#00979d", backgroundColor: (isTemp ? "#e74c3c" : "#00979d") + "12", fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 }] },
          options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { min: isTemp ? 15 : 30, max: isTemp ? 35 : 90, ticks: { font: { size: 10 }, maxTicksLimit: 4, color: "#aaa" }, grid: { color: "#f5f5f5" } } } },
        });
        chartInstances.current.set(type, chart);
      });
    }, 50);
  }, [widgets]);

  useEffect(() => {
    const onLight = (e: Event) => setSensors((p) => ({ ...p, light: (e as CustomEvent).detail }));
    const onFan = (e: Event) => setSensors((p) => ({ ...p, fan: (e as CustomEvent).detail as number }));
    const onRemove = (e: Event) => {
      const wid = (e as CustomEvent).detail;
      const g = grid.current;
      const el = g?.getGridItems().find((el) => el.getAttribute("gs-id") === wid);
      if (el && g) g.removeWidget(el);
      chartInstances.current.get(wid)?.destroy();
      chartInstances.current.delete(wid);
      setWidgets((p) => p.filter((w) => w.id !== wid));
    };
    window.addEventListener("toggle-light", onLight);
    window.addEventListener("set-fan", onFan);
    window.addEventListener("remove-widget", onRemove);
    return () => {
      window.removeEventListener("toggle-light", onLight);
      window.removeEventListener("set-fan", onFan);
      window.removeEventListener("remove-widget", onRemove);
    };
  }, []);

  function handleEditToggle() {
    const next = !editMode;
    setEditMode(next);
    if (!next) setShowPalette(false);
  }

  function handleAddWidget(type: WidgetType) {
    setWidgets((p) => [...p, { id: genId(), type }]);
  }

  return (
    <div className="layout">
      <header className="global-header">
        <div className="header-left">
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
            <img src="/greenhouse-logo.png" alt="Greenhouse" width="22" height="22" style={{ objectFit: "contain" }} />
          </div>
          <span className="brand">Smart Green House</span>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-name">D M N K Premar...</span>
            <span className="user-email">lithula7@gmail.com</span>
          </div>
          <div className="user-avatar">D</div>
        </div>
      </header>

      <Sidebar />

      <main className="dashboard-layout" style={{ position: "relative" }}>
        {/* Top Bar */}
        <div className="dashboard-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="btn btn-sm" onClick={() => router.push("/dashboard")} style={{ padding: "4px 8px" }}>
              <ArrowLeft size={14} />
            </button>
            <div>
              <h1 style={{ fontSize: 20, margin: 0 }}>{dashName}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                <span style={{ fontSize: 12, color: "var(--text-light)" }}>Online</span>
              </div>
            </div>
          </div>
          <div className="topbar-actions">
            {editMode && (
              <button className="btn btn-sm" onClick={() => { setShowPalette(!showPalette); setPaletteTab("widgets"); }}>
                <Plus size={14} /> Widget
              </button>
            )}
            <button
              className={`btn btn-sm ${editMode ? "btn-primary" : ""}`}
              onClick={handleEditToggle}
              style={{ minWidth: 80, justifyContent: "center" }}
            >
              {editMode ? <EyeOff size={14} /> : <Eye size={14} />}
              {editMode ? "Preview" : "Edit"}
            </button>
          </div>
        </div>

        {/* Widget Palette */}
        {showPalette && editMode && (
          <div style={{
            position: "absolute", right: 24, top: 80, zIndex: 100,
            width: 280, background: "#fff", borderRadius: 12,
            border: "1px solid var(--border)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}>
            <div style={{
              display: "flex", borderBottom: "1px solid var(--border)",
            }}>
              <button
                onClick={() => setPaletteTab("widgets")}
                style={{
                  flex: 1, padding: "10px 16px", border: "none", background: paletteTab === "widgets" ? "#fff" : "#f8f9fa",
                  fontSize: 13, fontWeight: 600, cursor: "pointer", color: paletteTab === "widgets" ? "var(--teal)" : "var(--text-light)",
                  borderBottom: paletteTab === "widgets" ? `2px solid var(--teal)` : "2px solid transparent",
                }}
              >
                Widgets
              </button>
              <button
                onClick={() => setPaletteTab("variables")}
                style={{
                  flex: 1, padding: "10px 16px", border: "none", background: paletteTab === "variables" ? "#fff" : "#f8f9fa",
                  fontSize: 13, fontWeight: 600, cursor: "pointer", color: paletteTab === "variables" ? "var(--teal)" : "var(--text-light)",
                  borderBottom: paletteTab === "variables" ? `2px solid var(--teal)` : "2px solid transparent",
                }}
              >
                Variables
              </button>
            </div>

            {paletteTab === "widgets" && (
              <div style={{ padding: 12, maxHeight: 400, overflowY: "auto" }}>
                {(Object.entries(WIDGET_META) as [WidgetType, WidgetMeta][]).map(([type, meta]) => (
                  <button
                    key={type}
                    onClick={() => { handleAddWidget(type); setShowPalette(false); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, width: "100%",
                      padding: "10px 12px", border: "none", background: "none",
                      cursor: "pointer", borderRadius: 8, fontSize: 13, textAlign: "left",
                      fontFamily: "inherit", transition: "background 0.15s",
                    }}
                    className="palette-item"
                  >
                    <span style={{ fontSize: 20, width: 32, textAlign: "center", flexShrink: 0 }}>
                      {meta.iconEl}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 1 }}>{meta.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-light)" }}>{meta.desc}</div>
                    </div>
                    <Plus size={14} style={{ color: "var(--text-light)", flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            )}

            {paletteTab === "variables" && (
              <div style={{ padding: 20, textAlign: "center", color: "var(--text-light)", fontSize: 13 }}>
                <p style={{ margin: "0 0 8px" }}>No variables linked yet.</p>
                <p style={{ margin: 0, fontSize: 12 }}>Add variables from your Things to connect widgets to live data.</p>
              </div>
            )}
          </div>
        )}

        {/* Edit mode banner */}
        {editMode && (
          <div style={{
            background: "linear-gradient(135deg, #00979d, #007b80)", color: "#fff",
            borderRadius: 10, padding: "12px 20px", marginBottom: 16,
            display: "flex", alignItems: "center", gap: 12, fontSize: 13,
          }}>
            <Eye size={16} />
            <span style={{ flex: 1 }}>You are in <strong>Edit Mode</strong>. Drag widgets to rearrange, resize from the bottom-right corner, or delete using the × button.</span>
            <button
              onClick={handleEditToggle}
              style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: "6px 16px", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 12 }}
            >
              Done
            </button>
          </div>
        )}

        {/* Widget Grid */}
        <div className="section" style={{
          padding: 16,
          background: editMode ? "#f8f9fa" : "#fff",
          border: editMode ? "2px dashed #d0d5dd" : "none",
          borderRadius: 12, minHeight: 500,
        }}>
          <div className="grid-stack" ref={gridRef} />
          {widgets.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-light)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
              <p style={{ fontSize: 15, fontWeight: 500, margin: "0 0 4px" }}>This dashboard is empty</p>
              <p style={{ fontSize: 13, margin: "0 0 16px" }}>Click "Edit" then "Add Widget" to get started</p>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .palette-item:hover { background: #f0fdfe; }
        .widget-drag-bar {
          position: absolute; top: 0; left: 0; right: 0;
          height: 28px; background: rgba(0,151,157,0.06);
          border-bottom: 1px solid rgba(0,151,157,0.1);
          display: flex; align-items: center; justify-content: center;
          cursor: grab; color: var(--teal); border-radius: 10px 10px 0 0;
        }
        .widget-drag-bar:active { cursor: grabbing; }
        .widget-remove-btn {
          position: absolute; top: 4px; right: 4px; z-index: 10;
          width: 24px; height: 24px; border-radius: 6px;
          border: none; background: rgba(239,68,68,0.1); color: #ef4444;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .widget-remove-btn:hover { background: rgba(239,68,68,0.2); }
        .grid-stack-item.ui-draggable-disabled .grid-stack-item-content {
          cursor: default;
        }
        .grid-stack-item .ui-resizable-handle {
          background: var(--teal); border-radius: 50%;
          width: 10px; height: 10px; right: -5px; bottom: -5px;
          opacity: 0; transition: opacity 0.15s;
        }
        .grid-stack-item:hover .ui-resizable-handle {
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}

function renderWidget(
  w: Widget, s: Sensors,
  meta: WidgetMeta, removeBtn: string, dragHandle: string
): string {
  const body = renderBody(w.type, s);

  return `
    <div style="display:flex;flex-direction:column;height:100%;position:relative;padding-top:${dragHandle ? "28px" : "0"}">
      ${dragHandle}
      ${removeBtn}
      <div style="padding:14px 16px;flex:1;display:flex;flex-direction:column;min-height:0">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-size:16px">${meta.iconEl}</span>
          <span style="font-size:13px;font-weight:600;color:var(--text-light);text-transform:uppercase;letter-spacing:0.3px">${meta.label}</span>
        </div>
        ${body}
      </div>
    </div>
  `;
}

function renderBody(type: WidgetType, s: Sensors): string {
  switch (type) {
    case "temp":
      return `
        <div style="font-size:32px;font-weight:700;color:var(--text);line-height:1.1">${s.temperature}°C</div>
        <div style="font-size:12px;color:var(--text-light);margin-bottom:8px">Last 20 readings</div>
        <canvas id="chart-temp" style="flex:1;min-height:0;width:100%"></canvas>
      `;
    case "humidity":
      return `
        <div style="font-size:32px;font-weight:700;color:var(--text);line-height:1.1">${s.humidity}%</div>
        <div style="font-size:12px;color:var(--text-light);margin-bottom:8px">Last 20 readings</div>
        <canvas id="chart-humidity" style="flex:1;min-height:0;width:100%"></canvas>
      `;
    case "light": {
      const on = s.light;
      return `
        <div style="display:flex;gap:8px;margin-top:4px">
          <button class="btn" style="flex:1;${on ? 'background:var(--teal);color:#fff;border-color:var(--teal)' : ''}" onclick="window.dispatchEvent(new CustomEvent('toggle-light',{detail:true}))">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>
            On
          </button>
          <button class="btn" style="flex:1;${!on ? 'background:var(--teal);color:#fff;border-color:var(--teal)' : ''}" onclick="window.dispatchEvent(new CustomEvent('toggle-light',{detail:false}))">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M2 2l20 20"/><path d="M8.91 14a4.61 4.61 0 0 1-1.41-2.5C5.23 10.23 5 9 5 8a6 6 0 0 1 5.92-6"/></svg>
            Off
          </button>
        </div>
        <div style="margin-top:12px;display:flex;align-items:center;gap:8px">
          <span style="width:8px;height:8px;border-radius:50%;background:${on ? '#22c55e' : '#9ca3af'}"></span>
          <span style="font-size:13px;color:var(--text-light)">${on ? 'ON' : 'OFF'}</span>
        </div>
      `;
    }
    case "fan":
      return `
        <div style="display:flex;align-items:center;gap:12px;margin-top:8px">
          <input type="range" min="0" max="100" value="${s.fan}" class="widget-slider" oninput="window.dispatchEvent(new CustomEvent('set-fan',{detail:parseInt(this.value)}))">
          <span style="font-size:24px;font-weight:700;color:var(--teal);min-width:48px;text-align:right">${s.fan}%</span>
        </div>
      `;
    case "water":
      return `
        <div style="font-size:32px;font-weight:700;color:var(--text);line-height:1.1">${s.water}%</div>
        <div class="widget-progress" style="margin-top:12px">
          <div class="widget-progress-bar" style="width:${s.water}%;background:linear-gradient(90deg,#00979d,#00d4aa)"></div>
        </div>
      `;
    default:
      return `<p style="color:var(--text-light)">Widget</p>`;
  }
}
