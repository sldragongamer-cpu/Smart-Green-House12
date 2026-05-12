"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.css";
import {
  Chart, LineController, LineElement, PointElement,
  LinearScale, CategoryScale, Tooltip, Filler,
} from "chart.js";
import { Plus, ArrowLeft, Eye, EyeOff, X } from "lucide-react";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);
GridStack.renderCB = (el, w) => { if (el && w?.content) el.innerHTML = w.content; };

interface Sensors { [key: string]: number | boolean; }
interface ThingVariable { name: string; type: string; direction: string; }
interface Widget {
  id: string; type: string; x: number; y: number; w: number; h: number;
  variable?: string; variableLabel?: string;
}

const WIDGET_TYPES = [
  { type: "value", lbl: "Value", icon: "📊", w: 3, h: 2, desc: "Display a numeric value" },
  { type: "chart", lbl: "Chart", icon: "📈", w: 4, h: 4, desc: "Line chart over time" },
  { type: "switch", lbl: "Switch", icon: "🔘", w: 2, h: 2, desc: "On/Off toggle" },
  { type: "slider", lbl: "Slider", icon: "🎚️", w: 3, h: 2, desc: "Numeric slider control" },
  { type: "progress", lbl: "Progress", icon: "📊", w: 2, h: 2, desc: "Progress bar" },
  { type: "msg", lbl: "Message", icon: "💬", w: 2, h: 2, desc: "Text message" },
] as const;

let nid = 1;
function gid() { return `w${nid++}`; }

export default function DashboardView() {
  const params = useParams();
  const router = useRouter();
  const gridRef = useRef<HTMLDivElement>(null);
  const grid = useRef<GridStack | null>(null);
  const charts = useRef<Map<string, Chart>>(new Map());
  const cdata = useRef<Map<string, { l: string[]; d: number[] }>>(new Map());

  const [sensors, setSensors] = useState<Sensors>({ temperature: 0, humidity: 0, light: false, fan: 0, water: 0 });
  const [ws, setWs] = useState<Widget[]>([]);
  const [edit, setEdit] = useState(false);
  const [showP, setShowP] = useState(false);
  const [pTab, setPTab] = useState<"w" | "v">("w");
  const [dashInfo, setDashInfo] = useState<any>({});
  const [thingVars, setThingVars] = useState<ThingVariable[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  const id = typeof params.id === "string" ? params.id : "";

  // Fetch dashboard info and Thing variables
  useEffect(() => {
    fetch(`/api/dashboards/${id}`).then((r) => r.json()).then((d) => {
      setDashInfo(d);
      if (d.thingId) {
        fetch("/api/things").then((r) => r.json()).then((things: any[]) => {
          const thing = things.find((t) => t.id === d.thingId);
          if (thing) setThingVars(thing.variables.map((v: any) => ({ name: v.name || v, type: v.type || "float", direction: v.direction || "device_to_cloud" })));
        });
      }
    }).catch(() => {});
  }, [id]);

  // Fetch and load widgets from API
  useEffect(() => {
    fetch(`/api/dashboards/${id}/widgets`).then((r) => r.json()).then((widgets) => {
      if (widgets.length > 0) {
        setWs(widgets);
      } else {
        setWs([
          { id: gid(), type: "value", x: 0, y: 0, w: 3, h: 2, variable: "temperature", variableLabel: "Temperature" },
          { id: gid(), type: "value", x: 3, y: 0, w: 3, h: 2, variable: "humidity", variableLabel: "Humidity" },
          { id: gid(), type: "chart", x: 0, y: 2, w: 6, h: 4, variable: "temperature", variableLabel: "Temperature History" },
          { id: gid(), type: "switch", x: 6, y: 0, w: 2, h: 2, variable: "light", variableLabel: "Light" },
          { id: gid(), type: "slider", x: 6, y: 2, w: 3, h: 2, variable: "fan", variableLabel: "Fan Speed" },
          { id: gid(), type: "progress", x: 0, y: 6, w: 3, h: 2, variable: "water", variableLabel: "Water Level" },
        ]);
      }
    }).catch(() => {
      setWs([
        { id: gid(), type: "value", x: 0, y: 0, w: 3, h: 2, variable: "temperature", variableLabel: "Temperature" },
        { id: gid(), type: "value", x: 3, y: 0, w: 3, h: 2, variable: "humidity", variableLabel: "Humidity" },
      ]);
    });
  }, [id]);

  // SSE for real-time sensor data
  useEffect(() => {
    const evtSource = new EventSource("/api/sse");
    evtSource.onmessage = (event) => {
      try {
        setSensors(JSON.parse(event.data));
      } catch {}
    };
    evtSource.onerror = () => {
      const iv = setInterval(async () => {
        const res = await fetch("/api/sensors");
        setSensors(await res.json());
      }, 3000);
      return () => clearInterval(iv);
    };
    return () => evtSource.close();
  }, []);

  // Init chart data stores for all chart-type widgets
  useEffect(() => {
    ws.forEach((w) => {
      if (w.type === "chart") cdata.current.set(w.id, { l: [], d: [] });
    });
  }, [ws]);

  // Update chart data on sensor changes
  useEffect(() => {
    if (!sensors) return;
    const t = new Date().toLocaleTimeString();
    ws.forEach((w) => {
      if (w.type !== "chart" || !w.variable) return;
      const st = cdata.current.get(w.id); if (!st) return;
      const val = sensors[w.variable];
      if (typeof val === "number") {
        st.l.push(t); st.d.push(val);
        if (st.l.length > 20) { st.l.shift(); st.d.shift(); }
        const ch = charts.current.get(w.id);
        if (ch) { ch.data.labels = [...st.l]; ch.data.datasets[0].data = [...st.d]; ch.update("none"); }
      }
    });
  }, [sensors, ws]);

  // Init GridStack
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

  // Sync widgets to grid
  const sync = useCallback(() => {
    const g = grid.current; if (!g) return;
    const ex = new Set(g.getGridItems().map((el) => el.getAttribute("gs-id")));
    ws.forEach((w) => {
      if (!ex.has(w.id)) g.addWidget({ id: w.id, x: w.x || 0, y: w.y || 50, w: w.w || 3, h: w.h || 2 });
    });
  }, [ws]);
  useEffect(() => { sync(); }, [sync]);

  const saveLayout = useCallback(() => {
    const g = grid.current; if (!g) return;
    const items = g.getGridItems();
    const updatedWidgets = items.map((el) => {
      const node = el.gridstackNode;
      const wid = el.getAttribute("gs-id");
      const w = ws.find((x) => x.id === wid);
      return { ...w, x: node?.x ?? w?.x ?? 0, y: node?.y ?? w?.y ?? 0, w: node?.w ?? w?.w ?? 3, h: node?.h ?? w?.h ?? 2 };
    });
    fetch(`/api/dashboards/${id}/widgets`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedWidgets),
    }).catch(() => {});
  }, [ws, id]);

  // Render widgets
  useEffect(() => {
    ws.forEach((w) => {
      const el = document.querySelector(`.grid-stack-item[gs-id="${w.id}"] .grid-stack-item-content`) as HTMLElement;
      if (!el) return;
      const val = w.variable ? sensors[w.variable] : undefined;
      const valStr = typeof val === "number" ? val.toString() : val ? "ON" : "OFF";
      const isNum = typeof val === "number";

      const rb = edit
        ? `<button class="w-rm" onclick="window.__rm('${w.id}')" style="position:absolute;top:6px;right:6px;z-index:10;width:24px;height:24px;border-radius:6px;border:none;background:rgba(239,68,68,0.1);color:#ef4444;cursor:pointer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg></button>`
        : "";
      const db = edit
        ? `<div style="position:absolute;top:0;left:0;right:0;height:28px;background:rgba(0,151,157,0.06);border-bottom:1px solid rgba(0,151,157,0.1);display:flex;align-items:center;justify-content:center;cursor:grab;color:var(--teal);border-radius:10px 10px 0 0"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg></div>`
        : "";
      el.innerHTML = `<div style="display:flex;flex-direction:column;height:100%;position:relative;padding-top:${edit ? "28px" : "0"}">${db}${rb}<div style="padding:14px 16px;flex:1;display:flex;flex-direction:column;min-height:0"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:13px;font-weight:600;color:var(--text-light);text-transform:uppercase;letter-spacing:0.3px">${w.variableLabel || w.variable || "Widget"}</span></div>${bodyHTML(w, val, isNum, valStr)}</div></div>`;
    });
  }, [sensors, ws, edit]);

  // Init Chart.js canvases for chart widgets
  useEffect(() => {
    const timer = setTimeout(() => {
      ws.forEach((w) => {
        if (w.type !== "chart") return;
        const cv = document.getElementById(`chart-${w.id}`) as HTMLCanvasElement;
        if (!cv || charts.current.has(w.id)) return;
        const ctx = cv.getContext("2d"); if (!ctx) return;
        charts.current.set(w.id, new Chart(ctx, {
          type: "line",
          data: { labels: [], datasets: [{ label: w.variableLabel || w.variable || "", data: [], borderColor: "#00979d", backgroundColor: "#00979d12", fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 }] },
          options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { ticks: { font: { size: 10 }, maxTicksLimit: 4, color: "#aaa" }, grid: { color: "#f5f5f5" } } } },
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
      cdata.current.delete(wid);
      setWs((p) => p.filter((x) => x.id !== wid));
      setTimeout(saveLayout, 100);
    };
    w.__light = (val: boolean) => {
      setSensors((p) => ({ ...p, light: val }));
      fetch("/api/control", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ light: val }) });
    };
    w.__fan = (val: string) => {
      const n = parseInt(val);
      setSensors((p) => ({ ...p, fan: n }));
      fetch("/api/control", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fan: n }) });
    };
    return () => { delete w.__rm; delete w.__light; delete w.__fan; };
  }, [saveLayout]);

  // Pick a variable for the selected widget
  function pickVariable(widgetId: string, varName: string) {
    setWs((p) => p.map((w) => w.id === widgetId ? { ...w, variable: varName, variableLabel: varName.charAt(0).toUpperCase() + varName.slice(1) } : w));
    setSelectedWidget(null);
  }

  function addWidget(type: string, variable?: string) {
    const meta = WIDGET_TYPES.find((w) => w.type === type) || WIDGET_TYPES[0];
    const newW: Widget = {
      id: gid(), type, x: 0, y: 50, w: meta.w, h: meta.h,
      variable, variableLabel: variable ? variable.charAt(0).toUpperCase() + variable.slice(1) : undefined,
    };
    setWs((p) => [...p, newW]);
    setTimeout(saveLayout, 100);
    setShowP(false);
  }

  const header = (
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
  );

  return (
    <div className="layout">
      {header}
      <Sidebar />
      <main className="dashboard-layout" style={{ position: "relative" }}>
        <div className="dashboard-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="btn btn-sm" onClick={() => router.push("/dashboard")} style={{ padding: "4px 8px" }}><ArrowLeft size={14} /></button>
            <div>
              <h1 style={{ fontSize: 20, margin: 0 }}>{dashInfo.name || "Dashboard"}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                <span style={{ fontSize: 12, color: "var(--text-light)" }}>Real-time</span>
                {dashInfo.thingName && (
                  <span style={{ fontSize: 12, color: "var(--teal)", background: "rgba(0,151,157,0.08)", padding: "1px 8px", borderRadius: 4 }}>
                    Thing: {dashInfo.thingName}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="topbar-actions">
            {edit && <button className="btn btn-sm" onClick={() => { setShowP(!showP); setPTab("w"); }}><Plus size={14} /> Widget</button>}
            <button className={`btn btn-sm ${edit ? "btn-primary" : ""}`} onClick={() => {
              const newEdit = !edit;
              setEdit(newEdit);
              setShowP(false);
              if (!newEdit) saveLayout();
            }} style={{ minWidth: 80, justifyContent: "center" }}>
              {edit ? <EyeOff size={14} /> : <Eye size={14} />}{edit ? " Preview" : " Edit"}
            </button>
          </div>
        </div>

        {showP && edit && (
          <div style={{ position: "absolute", right: 24, top: 80, zIndex: 100, width: 320, background: "#fff", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", overflow: "hidden" }}>
            <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
              <button onClick={() => setPTab("w")} style={{ flex: 1, padding: "10px 16px", border: "none", background: pTab === "w" ? "#fff" : "#f8f9fa", fontSize: 13, fontWeight: 600, cursor: "pointer", color: pTab === "w" ? "var(--teal)" : "var(--text-light)", borderBottom: pTab === "w" ? "2px solid var(--teal)" : "2px solid transparent" }}>Widgets</button>
              <button onClick={() => setPTab("v")} style={{ flex: 1, padding: "10px 16px", border: "none", background: pTab === "v" ? "#fff" : "#f8f9fa", fontSize: 13, fontWeight: 600, cursor: "pointer", color: pTab === "v" ? "var(--teal)" : "var(--text-light)", borderBottom: pTab === "v" ? "2px solid var(--teal)" : "2px solid transparent" }}>Variables</button>
            </div>
            {pTab === "w" && (
              <div style={{ padding: 12, maxHeight: 400, overflowY: "auto" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.5px", padding: "4px 8px 8px" }}>Add Widget</div>
                {WIDGET_TYPES.map((meta) => (
                  <div key={meta.type}>
                    <button onClick={() => {
                      // If there are thing variables, prompt to pick one; otherwise add unbound
                      if (thingVars.length > 0) {
                        setSelectedWidget(gid());
                        setPTab("v");
                      } else {
                        addWidget(meta.type);
                      }
                    }}
                      style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 12px", border: "none", background: "none", cursor: "pointer", borderRadius: 8, fontSize: 13, textAlign: "left", fontFamily: "inherit" }}>
                      <span style={{ fontSize: 20, width: 32, textAlign: "center" }}>{meta.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 1 }}>{meta.lbl}</div>
                        <div style={{ fontSize: 11, color: "var(--text-light)" }}>{meta.desc}</div>
                      </div>
                      <Plus size={14} style={{ color: "var(--text-light)" }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {pTab === "v" && (
              <div style={{ padding: 12, maxHeight: 400, overflowY: "auto" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.5px", padding: "4px 8px 8px" }}>
                  Thing Variables {dashInfo.thingName ? `(${dashInfo.thingName})` : ""}
                </div>
                {thingVars.length === 0 ? (
                  <div style={{ padding: 16, textAlign: "center", color: "var(--text-light)", fontSize: 13 }}>
                    <p style={{ margin: "0 0 8px" }}>No variables linked.</p>
                    <p style={{ margin: 0, fontSize: 12 }}>Associate this dashboard with a Thing to see its variables here.</p>
                  </div>
                ) : thingVars.map((v) => (
                  <button key={v.name} onClick={() => {
                    if (selectedWidget) {
                      pickVariable(selectedWidget, v.name);
                    } else {
                      addWidget("value", v.name);
                    }
                  }}
                    style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 12px", border: "none", background: "none", cursor: "pointer", borderRadius: 8, fontSize: 13, textAlign: "left", fontFamily: "inherit" }}>
                    <span style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(0,151,157,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📌</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 1 }}>{v.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-light)" }}>Click to add widget</div>
                    </div>
                    <Plus size={14} style={{ color: "var(--text-light)" }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {edit && (
          <div style={{ background: "linear-gradient(135deg, #00979d, #007b80)", color: "#fff", borderRadius: 10, padding: "12px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
            <Eye size={16} />
            <span style={{ flex: 1 }}>Edit Mode — drag to move, resize handles to scale. <strong>Layout saves when you exit edit mode.</strong></span>
            <button onClick={() => { setShowP(!showP); setPTab("w"); }} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: "6px 16px", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 12 }}><Plus size={12} style={{ marginRight: 4 }} />Add Widget</button>
            <button onClick={() => { setEdit(false); setShowP(false); saveLayout(); }} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: "6px 16px", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 12 }}>Done</button>
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
        .grid-stack-item .w-rm:hover { background: rgba(239,68,68,0.2) !important; }
      `}</style>
    </div>
  );
}

function bodyHTML(w: Widget, val: any, isNum: boolean, valStr: string): string {
  switch (w.type) {
    case "value":
      return `<div style="font-size:36px;font-weight:700;color:var(--text);line-height:1.2">${isNum ? valStr + (w.variable === "temperature" ? "°C" : w.variable === "humidity" ? "%" : "") : valStr}</div><div style="font-size:12px;color:var(--text-light);margin-top:4px">${w.variable || ""}</div>`;
    case "chart":
      return `<canvas id="chart-${w.id}" style="flex:1;min-height:0;width:100%;max-height:120px"></canvas>`;
    case "switch": {
      const on = val === true || val === 1 || val === "1" || val === "ON";
      return `<div style="display:flex;gap:8px;margin-top:8px"><button class="btn" style="flex:1;${on ? 'background:var(--teal);color:#fff;border-color:var(--teal)' : ''}" onclick="window.__light(true)">On</button><button class="btn" style="flex:1;${!on ? 'background:var(--teal);color:#fff;border-color:var(--teal)' : ''}" onclick="window.__light(false)">Off</button></div><div style="margin-top:12px;display:flex;align-items:center;gap:8px"><span style="width:8px;height:8px;border-radius:50%;background:${on ? '#22c55e' : '#9ca3af'};display:inline-block"></span><span style="font-size:13px;color:var(--text-light)">${on ? 'ON' : 'OFF'}</span></div>`;
    }
    case "slider":
      return `<div style="display:flex;align-items:center;gap:12px;margin-top:12px"><input type="range" min="0" max="100" value="${isNum ? val : 0}" class="widget-slider" oninput="window.__fan(this.value)"><span style="font-size:24px;font-weight:700;color:var(--teal);min-width:48px;text-align:right">${isNum ? val : 0}</span></div>`;
    case "progress":
      return `<div style="font-size:28px;font-weight:700;color:var(--text);line-height:1.1">${isNum ? val + "%" : valStr}</div><div class="widget-progress" style="margin-top:8px"><div class="widget-progress-bar" style="width:${isNum ? val : 0}%;background:linear-gradient(90deg,#00979d,#00d4aa)">${isNum ? val : 0}%</div></div>`;
    case "msg":
      return `<div style="font-size:14px;color:var(--text-light);padding:8px 0">${w.variable ? `${w.variableLabel || w.variable}: ${valStr}` : "Add a variable to show data"}</div>`;
    default:
      return `<div style="font-size:24px;font-weight:700;color:var(--text)">${valStr}</div>`;
  }
}
