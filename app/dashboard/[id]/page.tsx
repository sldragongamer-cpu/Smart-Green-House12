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
import { Plus, ArrowLeft, Eye, EyeOff } from "lucide-react";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);
GridStack.renderCB = (el, w) => { if (el && w?.content) el.innerHTML = w.content; };

function rand(b: number, s = 2) { return Math.max(0, Math.min(100, b + (Math.random() - 0.5) * s)); }

type WT = "temp" | "humidity" | "fan" | "light" | "water";
interface Widget { id: string; type: WT; }
interface Sensors { temperature: number; humidity: number; light: boolean; fan: number; water: number; }

let nid = 1;
function gid() { return `w${nid++}`; }

const META: Record<WT, { lbl: string; icon: string; w: number; h: number }> = {
  temp: { lbl: "Temperature", icon: "🌡️", w: 4, h: 4 },
  humidity: { lbl: "Humidity", icon: "💧", w: 4, h: 4 },
  fan: { lbl: "Fan Speed", icon: "🌀", w: 3, h: 3 },
  light: { lbl: "Light", icon: "💡", w: 2, h: 2 },
  water: { lbl: "Water Level", icon: "💦", w: 2, h: 2 },
};

const DNAMES: Record<string, string> = {
  "esp32-main": "ESP32", greenhouse: "Green House", "greenhouse-vars": "Green House Variables",
};

export default function DashboardView() {
  const params = useParams();
  const router = useRouter();
  const gridRef = useRef<HTMLDivElement>(null);
  const grid = useRef<GridStack | null>(null);
  const charts = useRef<Map<string, Chart>>(new Map());
  const cdata = useRef<Map<string, { l: string[]; d: number[] }>>(new Map());

  const [s, setS] = useState<Sensors>({ temperature: 24, humidity: 60, light: false, fan: 0, water: 45 });
  const [ws, setWs] = useState<Widget[]>([
    { id: gid(), type: "temp" }, { id: gid(), type: "humidity" },
    { id: gid(), type: "water" }, { id: gid(), type: "light" }, { id: gid(), type: "fan" },
  ]);
  const [edit, setEdit] = useState(false);
  const [showP, setShowP] = useState(false);
  const [pTab, setPTab] = useState<"w" | "v">("w");

  const id = typeof params.id === "string" ? params.id : "";
  const dname = DNAMES[id] || id;

  useEffect(() => { cdata.current.set("temp", { l: [], d: [] }); cdata.current.set("humidity", { l: [], d: [] }); }, []);
  useEffect(() => {
    const iv = setInterval(() => setS((p) => ({
      temperature: Math.round(rand(p.temperature) * 10) / 10,
      humidity: Math.round(rand(p.humidity, 1.5) * 10) / 10,
      light: p.light, fan: p.fan,
      water: Math.round(Math.max(0, Math.min(100, p.water + (Math.random() - 0.5) * 3))),
    })), 2000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const t = new Date().toLocaleTimeString();
    (["temp", "humidity"] as const).forEach((k) => {
      const st = cdata.current.get(k); if (!st) return;
      st.l.push(t); st.d.push(k === "temp" ? s.temperature : s.humidity);
      if (st.l.length > 20) { st.l.shift(); st.d.shift(); }
      const ch = charts.current.get(k);
      if (ch) { ch.data.labels = [...st.l]; ch.data.datasets[0].data = [...st.d]; ch.update("none"); }
    });
  }, [s]);

  useEffect(() => {
    if (!gridRef.current || grid.current) return;
    const g = GridStack.init({
      float: false, column: 12, cellHeight: 80, margin: 12,
      resizable: { handles: edit ? "all" : "none" },
      draggable: { handle: ".grid-stack-item-content" },
      disableDrag: !edit, disableResize: !edit, alwaysShowResizeHandle: edit,
    }, gridRef.current);
    grid.current = g;
    return () => { g.destroy(false); grid.current = null; };
  }, [edit]);

  const sync = useCallback(() => {
    const g = grid.current; if (!g) return;
    const ex = new Set(g.getGridItems().map((el) => el.getAttribute("gs-id")));
    ws.forEach((w) => { if (!ex.has(w.id)) { const m = META[w.type]; g.addWidget({ id: w.id, x: 0, y: 50, w: m.w, h: m.h }); } });
  }, [ws]);
  useEffect(() => { sync(); }, [sync]);

  // Render all widgets — full innerHTML replacement (simplest, most reliable)
  useEffect(() => {
    ws.forEach((w) => {
      const el = document.querySelector(`.grid-stack-item[gs-id="${w.id}"] .grid-stack-item-content`) as HTMLElement;
      if (!el) return;
      const m = META[w.type];
      const rb = edit
        ? `<button class="w-rm" onclick="window.__rm('${w.id}')" style="position:absolute;top:6px;right:6px;z-index:10;width:24px;height:24px;border-radius:6px;border:none;background:rgba(239,68,68,0.1);color:#ef4444;cursor:pointer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg></button>`
        : "";
      const db = edit
        ? `<div style="position:absolute;top:0;left:0;right:0;height:28px;background:rgba(0,151,157,0.06);border-bottom:1px solid rgba(0,151,157,0.1);display:flex;align-items:center;justify-content:center;cursor:grab;color:var(--teal);border-radius:10px 10px 0 0"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg></div>`
        : "";
      el.innerHTML = `<div style="display:flex;flex-direction:column;height:100%;position:relative;padding-top:${edit ? "28px" : "0"}">${db}${rb}<div style="padding:14px 16px;flex:1;display:flex;flex-direction:column;min-height:0"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:16px">${m.icon}</span><span style="font-size:13px;font-weight:600;color:var(--text-light);text-transform:uppercase;letter-spacing:0.3px">${m.lbl}</span></div>${bodyHTML(w.type, s)}</div></div>`;
    });
  }, [s, ws, edit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      (["temp", "humidity"] as const).forEach((t) => {
        const cv = document.getElementById(`chart-${t}`) as HTMLCanvasElement;
        if (!cv || charts.current.has(t)) return;
        const ctx = cv.getContext("2d"); if (!ctx) return;
        const isT = t === "temp";
        charts.current.set(t, new Chart(ctx, {
          type: "line",
          data: { labels: [], datasets: [{ label: isT ? "Temperature °C" : "Humidity %", data: [], borderColor: isT ? "#e74c3c" : "#00979d", backgroundColor: (isT ? "#e74c3c" : "#00979d") + "12", fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 }] },
          options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { min: isT ? 15 : 30, max: isT ? 35 : 90, ticks: { font: { size: 10 }, maxTicksLimit: 4, color: "#aaa" }, grid: { color: "#f5f5f5" } } } },
        }));
      });
    }, 50);
  }, [ws]);

  // Global event handlers
  useEffect(() => {
    const w = window as any;
    w.__rm = (wid: string) => {
      const g = grid.current;
      const el = g?.getGridItems().find((e) => e.getAttribute("gs-id") === wid);
      if (el && g) g.removeWidget(el);
      charts.current.get(wid)?.destroy(); charts.current.delete(wid);
      setWs((p) => p.filter((x) => x.id !== wid));
    };
    return () => { delete w.__rm; };
  }, []);

  // Listen for light/fan events from inline onclick handlers
  useEffect(() => {
    const hLight = (e: Event) => {
      const val = (e as CustomEvent).detail;
      setS((p) => ({ ...p, light: val }));
      fetch("/api/control", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ light: val }) });
    };
    const hFan = (e: Event) => {
      const val = (e as CustomEvent).detail as number;
      setS((p) => ({ ...p, fan: val }));
      fetch("/api/control", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fan: val }) });
    };
    addEventListener("ac-light", hLight);
    addEventListener("ac-fan", hFan);
    return () => { removeEventListener("ac-light", hLight); removeEventListener("ac-fan", hFan); };
  }, []);

  function addWidget(type: WT) { setWs((p) => [...p, { id: gid(), type }]); setShowP(false); }

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
            <button className="btn btn-sm" onClick={() => router.push("/dashboard")} style={{ padding: "4px 8px" }}><ArrowLeft size={14} /></button>
            <div>
              <h1 style={{ fontSize: 20, margin: 0 }}>{dname}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                <span style={{ fontSize: 12, color: "var(--text-light)" }}>Online</span>
              </div>
            </div>
          </div>
          <div className="topbar-actions">
            {edit && <button className="btn btn-sm" onClick={() => { setShowP(!showP); setPTab("w"); }}><Plus size={14} /> Widget</button>}
            <button className={`btn btn-sm ${edit ? "btn-primary" : ""}`} onClick={() => { setEdit(!edit); setShowP(false); }} style={{ minWidth: 80, justifyContent: "center" }}>
              {edit ? <EyeOff size={14} /> : <Eye size={14} />}{edit ? " Preview" : " Edit"}
            </button>
          </div>
        </div>

        {showP && edit && (
          <div style={{ position: "absolute", right: 24, top: 80, zIndex: 100, width: 280, background: "#fff", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", overflow: "hidden" }}>
            <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
              <button onClick={() => setPTab("w")} style={{ flex: 1, padding: "10px 16px", border: "none", background: pTab === "w" ? "#fff" : "#f8f9fa", fontSize: 13, fontWeight: 600, cursor: "pointer", color: pTab === "w" ? "var(--teal)" : "var(--text-light)", borderBottom: pTab === "w" ? "2px solid var(--teal)" : "2px solid transparent" }}>Widgets</button>
              <button onClick={() => setPTab("v")} style={{ flex: 1, padding: "10px 16px", border: "none", background: pTab === "v" ? "#fff" : "#f8f9fa", fontSize: 13, fontWeight: 600, cursor: "pointer", color: pTab === "v" ? "var(--teal)" : "var(--text-light)", borderBottom: pTab === "v" ? "2px solid var(--teal)" : "2px solid transparent" }}>Variables</button>
            </div>
            {pTab === "w" && (
              <div style={{ padding: 12, maxHeight: 400, overflowY: "auto" }}>
                {(Object.entries(META) as [WT, typeof META[WT]][]).map(([type, m]) => (
                  <button key={type} onClick={() => addWidget(type)} className="p-item"
                    style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 12px", border: "none", background: "none", cursor: "pointer", borderRadius: 8, fontSize: 13, textAlign: "left", fontFamily: "inherit" }}>
                    <span style={{ fontSize: 20, width: 32, textAlign: "center" }}>{m.icon}</span>
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 1 }}>{m.lbl}</div></div>
                    <Plus size={14} style={{ color: "var(--text-light)" }} />
                  </button>
                ))}
              </div>
            )}
            {pTab === "v" && <div style={{ padding: 20, textAlign: "center", color: "var(--text-light)", fontSize: 13 }}><p style={{ margin: "0 0 8px" }}>No variables linked yet.</p></div>}
          </div>
        )}

        {edit && (
          <div style={{ background: "linear-gradient(135deg, #00979d, #007b80)", color: "#fff", borderRadius: 10, padding: "12px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
            <Eye size={16} />
            <span style={{ flex: 1 }}>You are in <strong>Edit Mode</strong>. Drag or resize widgets.</span>
            <button onClick={() => { setShowP(!showP); setPTab("w"); }} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: "6px 16px", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 12 }}><Plus size={12} style={{ marginRight: 4 }} />Add Widget</button>
            <button onClick={() => { setEdit(false); setShowP(false); }} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: "6px 16px", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 12 }}>Done</button>
          </div>
        )}

        <div className="section" style={{ padding: 16, background: edit ? "#f8f9fa" : "#fff", border: edit ? "2px dashed #d0d5dd" : "none", borderRadius: 12, minHeight: 500 }}>
          <div className="grid-stack" ref={gridRef} />
        </div>
      </main>
      <style>{`
        .p-item:hover { background: #f0fdfe; }
        .grid-stack-item .ui-resizable-handle { background: var(--teal); border-radius: 50%; width: 10px; height: 10px; right: -5px; bottom: -5px; opacity: 0; transition: opacity 0.15s; }
        .grid-stack-item:hover .ui-resizable-handle { opacity: 0.7; }
      `}</style>
    </div>
  );
}

function bodyHTML(type: WT, s: Sensors): string {
  switch (type) {
    case "temp": return `<div style="font-size:32px;font-weight:700;color:var(--text);line-height:1.1">${s.temperature}°C</div><div style="font-size:12px;color:var(--text-light);margin-bottom:8px">Real-time</div><canvas id="chart-temp" style="flex:1;min-height:0;width:100%"></canvas>`;
    case "humidity": return `<div style="font-size:32px;font-weight:700;color:var(--text);line-height:1.1">${s.humidity}%</div><div style="font-size:12px;color:var(--text-light);margin-bottom:8px">Real-time</div><canvas id="chart-humidity" style="flex:1;min-height:0;width:100%"></canvas>`;
    case "fan":
      return `<div style="display:flex;align-items:center;gap:12px;margin-top:8px"><input type="range" min="0" max="100" value="${s.fan}" class="widget-slider" oninput="window.__fan(this.value)"><span style="font-size:24px;font-weight:700;color:var(--teal);min-width:48px;text-align:right">${s.fan}%</span></div>`;
    case "light": {
      const on = s.light;
      return `<div style="display:flex;gap:8px;margin-top:4px"><button class="btn" style="flex:1;${on ? 'background:var(--teal);color:#fff;border-color:var(--teal)' : ''}" onclick="window.__light(true)">💡 On</button><button class="btn" style="flex:1;${!on ? 'background:var(--teal);color:#fff;border-color:var(--teal)' : ''}" onclick="window.__light(false)">🔌 Off</button></div><div style="margin-top:12px;display:flex;align-items:center;gap:8px"><span style="width:8px;height:8px;border-radius:50%;background:${on ? '#22c55e' : '#9ca3af'};display:inline-block"></span><span style="font-size:13px;color:var(--text-light)">${on ? 'ON' : 'OFF'}</span></div>`;
    }
    case "water":
      return `<div style="font-size:32px;font-weight:700;color:var(--text);line-height:1.1">${s.water}%</div><div class="widget-progress" style="margin-top:12px"><div class="widget-progress-bar" style="width:${s.water}%;background:linear-gradient(90deg,#00979d,#00d4aa)">${s.water}%</div></div>`;
    default: return "";
  }
}

// Global inline event helpers (module-level, run once)
if (typeof window !== "undefined") {
  (window as any).__light = (val: boolean) => window.dispatchEvent(new CustomEvent("ac-light", { detail: val }));
  (window as any).__fan = (val: string) => window.dispatchEvent(new CustomEvent("ac-fan", { detail: parseInt(val) }));
}
