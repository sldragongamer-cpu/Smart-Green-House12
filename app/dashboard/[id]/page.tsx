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
  iconEl: string;
  desc: string;
  defaultW: number;
  defaultH: number;
}

const WIDGET_META: Record<WidgetType, WidgetMeta> = {
  temp: { label: "Temperature", iconEl: "🌡️", desc: "Real-time temperature with chart", defaultW: 4, defaultH: 4 },
  humidity: { label: "Humidity", iconEl: "💧", desc: "Real-time humidity with chart", defaultW: 4, defaultH: 4 },
  fan: { label: "Fan Speed", iconEl: "🌀", desc: "Adjust fan speed with slider", defaultW: 3, defaultH: 3 },
  light: { label: "Light", iconEl: "💡", desc: "Toggle light on/off", defaultW: 2, defaultH: 2 },
  water: { label: "Water Level", iconEl: "💦", desc: "Monitor water level", defaultW: 2, defaultH: 2 },
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
  const widgetRendered = useRef<Set<string>>(new Set());

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
      column: 12, cellHeight: 80, margin: 12,
      disableDrag: !editMode, disableResize: !editMode,
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

  // One-time setup: set widget structure and bind event listeners
  useEffect(() => {
    widgets.forEach((w) => {
      const el = document.querySelector(`.grid-stack-item[gs-id="${w.id}"] .grid-stack-item-content`);
      if (!el || widgetRendered.current.has(w.id)) return;
      widgetRendered.current.add(w.id);

      const meta = WIDGET_META[w.type];
      el.innerHTML = buildWidgetHTML(w, meta, sensors, editMode);
      bindWidgetListeners(el, w, setSensors, chartInstances, grid, setWidgets);
    });
  }, [widgets]);

  // Live-update sensor values without replacing innerHTML
  useEffect(() => {
    widgets.forEach((w) => {
      const el = document.querySelector(`.grid-stack-item[gs-id="${w.id}"] .grid-stack-item-content`);
      if (!el) return;
      updateWidgetValues(el, w, sensors, editMode);
    });
  }, [sensors, editMode]);

  // Init charts
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

        {showPalette && editMode && (
          <div style={{
            position: "absolute", right: 24, top: 80, zIndex: 100,
            width: 280, background: "#fff", borderRadius: 12,
            border: "1px solid var(--border)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", overflow: "hidden",
          }}>
            <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
              <button onClick={() => setPaletteTab("widgets")} style={{
                flex: 1, padding: "10px 16px", border: "none", background: paletteTab === "widgets" ? "#fff" : "#f8f9fa",
                fontSize: 13, fontWeight: 600, cursor: "pointer", color: paletteTab === "widgets" ? "var(--teal)" : "var(--text-light)",
                borderBottom: paletteTab === "widgets" ? "2px solid var(--teal)" : "2px solid transparent",
              }}>Widgets</button>
              <button onClick={() => setPaletteTab("variables")} style={{
                flex: 1, padding: "10px 16px", border: "none", background: paletteTab === "variables" ? "#fff" : "#f8f9fa",
                fontSize: 13, fontWeight: 600, cursor: "pointer", color: paletteTab === "variables" ? "var(--teal)" : "var(--text-light)",
                borderBottom: paletteTab === "variables" ? "2px solid var(--teal)" : "2px solid transparent",
              }}>Variables</button>
            </div>
            {paletteTab === "widgets" && (
              <div style={{ padding: 12, maxHeight: 400, overflowY: "auto" }}>
                {(Object.entries(WIDGET_META) as [WidgetType, WidgetMeta][]).map(([type, meta]) => (
                  <button key={type} onClick={() => { handleAddWidget(type); setShowPalette(false); }} className="palette-item"
                    style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 12px", border: "none", background: "none", cursor: "pointer", borderRadius: 8, fontSize: 13, textAlign: "left", fontFamily: "inherit" }}>
                    <span style={{ fontSize: 20, width: 32, textAlign: "center" }}>{meta.iconEl}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 1 }}>{meta.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-light)" }}>{meta.desc}</div>
                    </div>
                    <Plus size={14} style={{ color: "var(--text-light)" }} />
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

        {editMode && (
          <div style={{
            background: "linear-gradient(135deg, #00979d, #007b80)", color: "#fff",
            borderRadius: 10, padding: "12px 20px", marginBottom: 16,
            display: "flex", alignItems: "center", gap: 12, fontSize: 13,
          }}>
            <Eye size={16} />
            <span style={{ flex: 1 }}>You are in <strong>Edit Mode</strong>. Drag widgets to rearrange, resize from the bottom-right corner.</span>
            <button onClick={() => { setShowPalette(!showPalette); setPaletteTab("widgets"); }}
              style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: "6px 16px", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 12 }}>
              <Plus size={12} style={{ marginRight: 4 }} />Add Widget
            </button>
            <button onClick={handleEditToggle}
              style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: "6px 16px", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 12 }}>
              Done
            </button>
          </div>
        )}

        <div className="section" style={{
          padding: 16, background: editMode ? "#f8f9fa" : "#fff",
          border: editMode ? "2px dashed #d0d5dd" : "none", borderRadius: 12, minHeight: 500,
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
        .grid-stack-item .ui-resizable-handle {
          background: var(--teal); border-radius: 50%;
          width: 10px; height: 10px; right: -5px; bottom: -5px;
          opacity: 0; transition: opacity 0.15s;
        }
        .grid-stack-item:hover .ui-resizable-handle { opacity: 0.7; }
        .widget-btn-active { background: var(--teal) !important; color: #fff !important; border-color: var(--teal) !important; }
        .wv { font-size:32px; font-weight:700; color:var(--text); line-height:1.1; }
        .wsub { font-size:12px; color:var(--text-light); margin-bottom:8px; }
        .wlbl { font-size:13px; font-weight:600; color:var(--text-light); text-transform:uppercase; letter-spacing:0.3px; }
        .w-dot-on { width:8px; height:8px; border-radius:50%; background:#22c55e; display:inline-block; }
        .w-dot-off { width:8px; height:8px; border-radius:50%; background:#9ca3af; display:inline-block; }
      `}</style>
    </div>
  );
}

// ─── Build initial widget HTML (done once per widget) ───
function buildWidgetHTML(w: Widget, meta: WidgetMeta, s: Sensors, edit: boolean): string {
  const removeBtn = edit
    ? `<button class="w-remove" data-wid="${w.id}" style="position:absolute;top:6px;right:6px;z-index:10;width:24px;height:24px;border-radius:6px;border:none;background:rgba(239,68,68,0.1);color:#ef4444;cursor:pointer;display:flex;align-items:center;justify-content:center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
       </button>`
    : "";
  const dragBar = edit
    ? `<div class="w-drag" style="position:absolute;top:0;left:0;right:0;height:28px;background:rgba(0,151,157,0.06);border-bottom:1px solid rgba(0,151,157,0.1);display:flex;align-items:center;justify-content:center;cursor:grab;color:var(--teal);border-radius:10px 10px 0 0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>
       </div>`
    : "";

  const body = buildBodyHTML(w.type, s);

  return `
    <div style="display:flex;flex-direction:column;height:100%;position:relative;padding-top:${edit ? "28px" : "0"}">
      ${dragBar}
      ${removeBtn}
      <div style="padding:14px 16px;flex:1;display:flex;flex-direction:column;min-height:0">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-size:16px">${meta.iconEl}</span>
          <span class="wlbl">${meta.label}</span>
        </div>
        <div class="w-body" data-type="${w.type}" data-wid="${w.id}">
          ${body}
        </div>
      </div>
    </div>
  `;
}

// ─── Build widget body HTML ───
function buildBodyHTML(type: WidgetType, s: Sensors): string {
  switch (type) {
    case "temp":
      return `<div class="wv">${s.temperature}°C</div><div class="wsub">Last 20 readings</div><canvas id="chart-temp" style="flex:1;min-height:0;width:100%"></canvas>`;
    case "humidity":
      return `<div class="wv">${s.humidity}%</div><div class="wsub">Last 20 readings</div><canvas id="chart-humidity" style="flex:1;min-height:0;width:100%"></canvas>`;
    case "light":
      return `
        <div style="display:flex;gap:8px;margin-top:4px">
          <button class="btn widget-btn" data-action="light-on" style="flex:1">💡 On</button>
          <button class="btn widget-btn" data-action="light-off" style="flex:1">🔌 Off</button>
        </div>
        <div style="margin-top:12px;display:flex;align-items:center;gap:8px">
          <span class="status-dot"></span>
          <span class="status-text" style="font-size:13px;color:var(--text-light)"></span>
        </div>
      `;
    case "fan":
      return `
        <div style="display:flex;align-items:center;gap:12px;margin-top:8px">
          <input type="range" min="0" max="100" class="widget-slider fan-slider">
          <span class="fan-val" style="font-size:24px;font-weight:700;color:var(--teal);min-width:48px;text-align:right">${s.fan}%</span>
        </div>
      `;
    case "water":
      return `
        <div class="wv">${s.water}%</div>
        <div class="widget-progress" style="margin-top:12px">
          <div class="widget-progress-bar water-bar" style="width:${s.water}%;background:linear-gradient(90deg,#00979d,#00d4aa)">${s.water}%</div>
        </div>
      `;
    default:
      return `<p style="color:var(--text-light)">Widget</p>`;
  }
}

// ─── Update values without replacing DOM ───
function updateWidgetValues(el: Element, w: Widget, s: Sensors, edit: boolean) {
  const body = el.querySelector(".w-body") as HTMLElement;
  if (!body) return;

  // Edit mode: toggle remove/drag visibility
  const removeBtn = el.querySelector(".w-remove") as HTMLElement;
  const dragBar = el.querySelector(".w-drag") as HTMLElement;
  if (removeBtn) removeBtn.style.display = edit ? "flex" : "none";
  if (dragBar) dragBar.style.display = edit ? "flex" : "none";

  switch (w.type) {
    case "temp": {
      const v = body.querySelector(".wv");
      if (v) v.textContent = `${s.temperature}°C`;
      break;
    }
    case "humidity": {
      const v = body.querySelector(".wv");
      if (v) v.textContent = `${s.humidity}%`;
      break;
    }
    case "light": {
      const onBtn = body.querySelector('[data-action="light-on"]') as HTMLButtonElement;
      const offBtn = body.querySelector('[data-action="light-off"]') as HTMLButtonElement;
      const dot = body.querySelector(".status-dot") as HTMLElement;
      const text = body.querySelector(".status-text") as HTMLElement;
      if (onBtn) onBtn.className = `btn widget-btn${s.light ? " widget-btn-active" : ""}`;
      if (offBtn) offBtn.className = `btn widget-btn${!s.light ? " widget-btn-active" : ""}`;
      if (dot) dot.className = s.light ? "status-dot w-dot-on" : "status-dot w-dot-off";
      if (text) text.textContent = s.light ? "ON" : "OFF";
      break;
    }
    case "fan": {
      const slider = body.querySelector(".fan-slider") as HTMLInputElement;
      const val = body.querySelector(".fan-val") as HTMLElement;
      if (slider && slider.value !== String(s.fan)) slider.value = String(s.fan);
      if (val) val.textContent = `${s.fan}%`;
      break;
    }
    case "water": {
      const v = body.querySelector(".wv");
      const bar = body.querySelector(".water-bar") as HTMLElement;
      if (v) v.textContent = `${s.water}%`;
      if (bar) { bar.style.width = `${s.water}%`; bar.textContent = `${s.water}%`; }
      break;
    }
  }
}

// ─── Bind event listeners (done once per widget) ───
function bindWidgetListeners(
  el: Element, w: Widget,
  setSensors: React.Dispatch<React.SetStateAction<Sensors>>,
  chartInstances: React.MutableRefObject<Map<string, Chart>>,
  grid: React.MutableRefObject<GridStack | null>,
  setWidgets: React.Dispatch<React.SetStateAction<Widget[]>>,
) {
  const body = el.querySelector(".w-body") as HTMLElement;
  if (!body) return;

  // Light buttons
  const onBtn = body.querySelector('[data-action="light-on"]');
  const offBtn = body.querySelector('[data-action="light-off"]');
  onBtn?.addEventListener("click", () => {
    setSensors((p) => ({ ...p, light: true }));
    fetch("/api/control", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ light: true }) });
  });
  offBtn?.addEventListener("click", () => {
    setSensors((p) => ({ ...p, light: false }));
    fetch("/api/control", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ light: false }) });
  });

  // Fan slider
  const slider = body.querySelector(".fan-slider") as HTMLInputElement;
  slider?.addEventListener("input", () => {
    const val = parseInt(slider.value) || 0;
    setSensors((p) => ({ ...p, fan: val }));
    fetch("/api/control", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fan: val }) });
    const label = body.querySelector(".fan-val") as HTMLElement;
    if (label) label.textContent = `${val}%`;
  });

  // Remove button
  const removeBtn = el.querySelector(".w-remove") as HTMLElement;
  removeBtn?.addEventListener("click", () => {
    const g = grid.current;
    const item = g?.getGridItems().find((el) => el.getAttribute("gs-id") === w.id);
    if (item && g) g.removeWidget(item);
    chartInstances.current.get(w.id)?.destroy();
    chartInstances.current.delete(w.id);
    setWidgets((p) => p.filter((x) => x.id !== w.id));
  });
}
