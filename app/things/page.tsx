"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import {
  Plus, X, Trash2, Cpu, Wifi, WifiOff, ArrowLeft,
  ChevronDown, ChevronUp, Settings, RefreshCw,
} from "lucide-react";

type VarType = "boolean" | "integer" | "float" | "string";
type VarDirection = "device_to_cloud" | "cloud_to_device" | "bidirectional";

interface ThingVariable {
  name: string; type: VarType; direction: VarDirection; min?: number; max?: number;
}
interface Thing {
  id: string; name: string; device: string; deviceId: string; sketch: string;
  variables: ThingVariable[]; lastModified: string; created: string;
}
interface Device { id: string; name: string; type: string; status: string; }

const VAR_TYPES: VarType[] = ["boolean", "integer", "float", "string"];
const VAR_DIRECTIONS: { value: VarDirection; label: string; icon: string }[] = [
  { value: "device_to_cloud", label: "Device → Cloud", icon: "📤" },
  { value: "cloud_to_device", label: "Cloud → Device", icon: "📥" },
  { value: "bidirectional", label: "Bidirectional", icon: "⇄" },
];

const DIRECTION_ICON: Record<string, string> = {
  device_to_cloud: "📤", cloud_to_device: "📥", bidirectional: "⇄",
};

export default function Things() {
  const [things, setThings] = useState<Thing[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThing, setSelectedThing] = useState<Thing | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingVar, setEditingVar] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"variables" | "device" | "sketch">("variables");

  // Create form state
  const [form, setForm] = useState({
    name: "", deviceId: "", sketch: "", variables: [] as ThingVariable[],
  });
  const [newVarName, setNewVarName] = useState("");
  const [newVarType, setNewVarType] = useState<VarType>("float");
  const [newVarDir, setNewVarDir] = useState<VarDirection>("device_to_cloud");

  async function fetchData() {
    const [tRes, dRes] = await Promise.all([
      fetch("/api/things").then((r) => r.json()),
      fetch("/api/devices").then((r) => r.json()),
    ]);
    setThings(tRes);
    setDevices(dRes);
    setLoading(false);
  }
  useEffect(() => { fetchData(); }, []);

  function getDeviceStatus(deviceId: string): Device | undefined {
    return devices.find((d) => d.id === deviceId);
  }

  async function handleCreate() {
    if (!form.name.trim()) return;
    const selectedDevice = devices.find((d) => d.id === form.deviceId);
    const res = await fetch("/api/things", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        device: selectedDevice?.name || "",
        deviceId: form.deviceId,
        sketch: form.sketch,
        variables: form.variables,
      }),
    });
    const thing = await res.json();
    setThings([thing, ...things]);
    setShowCreate(false);
    setForm({ name: "", deviceId: "", sketch: "", variables: [] });
  }

  async function handleSaveThing(thing: Thing) {
    await fetch(`/api/things/${thing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(thing),
    });
    setSelectedThing(thing);
    fetchData();
    setEditingVar(null);
  }

  async function handleDeleteThing(id: string) {
    await fetch(`/api/things/${id}`, { method: "DELETE" });
    setThings(things.filter((t) => t.id !== id));
    if (selectedThing?.id === id) setSelectedThing(null);
  }

  function addVariableToForm() {
    if (!newVarName.trim()) return;
    setForm({
      ...form,
      variables: [...form.variables, { name: newVarName.trim(), type: newVarType, direction: newVarDir }],
    });
    setNewVarName("");
  }

  function removeFormVariable(idx: number) {
    setForm({ ...form, variables: form.variables.filter((_, i) => i !== idx) });
  }

  function addVariableToThing() {
    if (!newVarName.trim() || !selectedThing) return;
    const updated: Thing = {
      ...selectedThing,
      variables: [...selectedThing.variables, { name: newVarName.trim(), type: newVarType, direction: newVarDir }],
    };
    handleSaveThing(updated);
    setNewVarName("");
  }

  function removeThingVariable(varName: string) {
    if (!selectedThing) return;
    const updated: Thing = {
      ...selectedThing,
      variables: selectedThing.variables.filter((v) => v.name !== varName),
    };
    handleSaveThing(updated);
  }

  function updateVariableDirection(varName: string, direction: VarDirection) {
    if (!selectedThing) return;
    const updated: Thing = {
      ...selectedThing,
      variables: selectedThing.variables.map((v) => v.name === varName ? { ...v, direction } : v),
    };
    handleSaveThing(updated);
  }

  function updateVariableType(varName: string, type: VarType) {
    if (!selectedThing) return;
    const updated: Thing = {
      ...selectedThing,
      variables: selectedThing.variables.map((v) => v.name === varName ? { ...v, type } : v),
    };
    handleSaveThing(updated);
  }

  function linkDevice(deviceId: string) {
    if (!selectedThing) return;
    const device = devices.find((d) => d.id === deviceId);
    const updated: Thing = {
      ...selectedThing,
      deviceId,
      device: device?.name || "",
    };
    handleSaveThing(updated);
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

  // ─── Detail View ───
  if (selectedThing) {
    const device = getDeviceStatus(selectedThing.deviceId);
    return (
      <div className="layout">
        {header}
        <Sidebar />
        <main className="content">
          <div className="page-header">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button className="btn btn-sm" onClick={() => setSelectedThing(null)} style={{ padding: "4px 8px" }}>
                <ArrowLeft size={14} />
              </button>
              <div>
                <h1 style={{ fontSize: 20, margin: 0 }}>{selectedThing.name}</h1>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: device?.status === "online" ? "#22c55e" : "#9ca3af", display: "inline-block" }} />
                  <span style={{ fontSize: 12, color: "var(--text-light)" }}>{device?.status === "online" ? "Online" : "Offline"}</span>
                  <span style={{ fontSize: 12, color: "var(--text-light)" }}>·</span>
                  <span style={{ fontSize: 12, color: "var(--teal)" }}>{selectedThing.variables.length} variables</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-sm" onClick={() => handleDeleteThing(selectedThing.id)} style={{ color: "#ef4444" }}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--border)", marginBottom: 24 }}>
            {(["variables", "device", "sketch"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding: "10px 20px", border: "none", background: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", color: activeTab === tab ? "var(--teal)" : "var(--text-light)", borderBottom: activeTab === tab ? "2px solid var(--teal)" : "2px solid transparent", fontFamily: "inherit", textTransform: "capitalize" }}>
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "variables" && (
            <div className="section">
              <div className="section-header">
                <h2>Variables</h2>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input type="text" placeholder="New variable name" value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addVariableToThing()}
                    style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 13, width: 160, fontFamily: "inherit" }} />
                  <select value={newVarType} onChange={(e) => setNewVarType(e.target.value as VarType)}
                    style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 13, background: "#fff", fontFamily: "inherit" }}>
                    {VAR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select value={newVarDir} onChange={(e) => setNewVarDir(e.target.value as VarDirection)}
                    style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 13, background: "#fff", fontFamily: "inherit" }}>
                    {VAR_DIRECTIONS.map((d) => <option key={d.value} value={d.value}>{d.icon} {d.label}</option>)}
                  </select>
                  <button className="btn btn-sm btn-primary" onClick={addVariableToThing}>
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>
              <div className="section-body">
                {selectedThing.variables.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", color: "var(--text-light)" }}>No variables defined for this Thing.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {selectedThing.variables.map((v) => (
                      <div key={v.name}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
                        <div style={{ flex: 1, fontWeight: 500, fontFamily: "monospace", fontSize: 14 }}>{v.name}</div>

                        <select value={v.type} onChange={(e) => updateVariableType(v.name, e.target.value as VarType)}
                          style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 12, background: "#fff", fontFamily: "inherit", color: "var(--text-light)" }}>
                          {VAR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>

                        <div style={{ display: "flex", gap: 4, background: "rgba(0,151,157,0.06)", borderRadius: 6, padding: 2 }}>
                          {VAR_DIRECTIONS.map((d) => (
                            <button key={d.value} onClick={() => updateVariableDirection(v.name, d.value)}
                              style={{ padding: "4px 10px", borderRadius: 4, border: "none", cursor: "pointer", fontSize: 12, fontFamily: "inherit", background: v.direction === d.value ? "var(--teal)" : "transparent", color: v.direction === d.value ? "#fff" : "var(--text-light)", transition: "all 0.15s" }}>
                              {d.icon}
                            </button>
                          ))}
                        </div>

                        {v.min !== undefined && (
                          <span style={{ fontSize: 11, color: "var(--text-light)" }}>{v.min}..{v.max}</span>
                        )}

                        <button className="card-menu" onClick={() => removeThingVariable(v.name)} title="Remove">
                          <X size={14} style={{ color: "#ef4444" }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "device" && (
            <div className="section">
              <div className="section-header"><h2>Associated Device</h2></div>
              <div className="section-body" style={{ padding: 20 }}>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label>Device</label>
                  <select value={selectedThing.deviceId} onChange={(e) => linkDevice(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 14, fontFamily: "inherit", background: "#fff", marginTop: 4 }}>
                    <option value="">No device linked</option>
                    {devices.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.type}) — {d.status === "online" ? "Online" : "Offline"}
                      </option>
                    ))}
                  </select>
                </div>
                {device && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "rgba(0,151,157,0.04)", borderRadius: 8 }}>
                    <Cpu size={20} style={{ color: "var(--teal)" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{device.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-light)" }}>{device.type}</div>
                    </div>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: device.status === "online" ? "#22c55e" : "#9ca3af" }}>
                      {device.status === "online" ? <Wifi size={14} /> : <WifiOff size={14} />}
                      {device.status === "online" ? "Online" : "Offline"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "sketch" && (
            <div className="section">
              <div className="section-header"><h2>Sketch</h2></div>
              <div className="section-body" style={{ padding: 20 }}>
                <div className="form-group">
                  <label>Sketch Name</label>
                  <input type="text" value={selectedThing.sketch}
                    onChange={(e) => setSelectedThing({ ...selectedThing, sketch: e.target.value })}
                    onBlur={() => handleSaveThing(selectedThing)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 14, fontFamily: "inherit", marginTop: 4 }} />
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-light)" }}>
                  The sketch defines the code that runs on your device.
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ─── List View ───
  return (
    <div className="layout">
      {header}
      <Sidebar />
      <main className="content">
        <div className="page-header">
          <h1>Things</h1>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(!showCreate)}>
            <Plus size={14} /> Create Thing
          </button>
        </div>

        {showCreate && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
               onClick={() => setShowCreate(false)}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 32, width: 520, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}
                 onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Create Thing</h2>
                <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6c757d", padding: 4 }}><X size={20} /></button>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Thing Name</label>
                <input type="text" placeholder="e.g. Weather Station" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Device</label>
                <select value={form.deviceId} onChange={(e) => setForm({ ...form, deviceId: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 14, fontFamily: "inherit", background: "#fff", marginTop: 4 }}>
                  <option value="">Select a device</option>
                  {devices.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.type})</option>)}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Sketch</label>
                <input type="text" placeholder="Sketch name" value={form.sketch}
                  onChange={(e) => setForm({ ...form, sketch: e.target.value })} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.4px", display: "block", marginBottom: 8 }}>Variables</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  <input type="text" placeholder="Variable name" value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addVariableToForm()}
                    style={{ flex: 1, minWidth: 140, padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 13, fontFamily: "inherit" }} />
                  <select value={newVarType} onChange={(e) => setNewVarType(e.target.value as VarType)}
                    style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 13, background: "#fff", fontFamily: "inherit" }}>
                    {VAR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select value={newVarDir} onChange={(e) => setNewVarDir(e.target.value as VarDirection)}
                    style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 13, background: "#fff", fontFamily: "inherit" }}>
                    {VAR_DIRECTIONS.map((d) => <option key={d.value} value={d.value}>{d.icon}</option>)}
                  </select>
                  <button className="btn btn-sm" onClick={addVariableToForm}>Add</button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {form.variables.map((v, i) => (
                    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", background: "rgba(0,151,157,0.08)", color: "var(--teal)", borderRadius: 4, fontSize: 12, fontWeight: 500 }}>
                      <span style={{ fontFamily: "monospace" }}>{v.name}</span>
                      <span style={{ fontSize: 10, opacity: 0.7 }}>{v.type}</span>
                      <span style={{ fontSize: 10 }}>{DIRECTION_ICON[v.direction]}</span>
                      <X size={12} style={{ cursor: "pointer", opacity: 0.6 }} onClick={() => removeFormVariable(i)} />
                    </span>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary" onClick={handleCreate} style={{ width: "100%", justifyContent: "center" }}>
                Create Thing
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-light)" }}>Loading...</div>
        ) : things.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-light)" }}>
            <p style={{ fontSize: 15, marginBottom: 12 }}>No things yet</p>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={14} /> Create Thing</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
            {things.map((t) => {
              const device = getDeviceStatus(t.deviceId);
              return (
                <div
                  key={t.id} onClick={() => setSelectedThing(t)}
                  style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--border)", padding: 0, cursor: "pointer", transition: "box-shadow 0.2s, transform 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "none"; }}>
                  {/* Card header */}
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: device?.status === "online" ? "#22c55e" : "#9ca3af", flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{t.name}</span>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--text-light)", display: "flex", alignItems: "center", gap: 4 }}>
                      {device?.status === "online" ? <><Wifi size={12} /> Online</> : <><WifiOff size={12} /> Offline</>}
                    </span>
                  </div>

                  {/* Device info */}
                  <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
                    <Cpu size={14} style={{ color: "var(--text-light)" }} />
                    <span style={{ fontSize: 13, color: "var(--text)" }}>{t.device || "No device linked"}</span>
                  </div>

                  {/* Variables */}
                  <div style={{ padding: "12px 20px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 8 }}>Variables</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {t.variables.map((v) => (
                        <span key={v.name}
                          style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 8px", background: "rgba(0,151,157,0.06)", borderRadius: 4, fontSize: 11, fontFamily: "monospace", color: "var(--text)" }}>
                          {v.name}
                          <span style={{ color: "var(--text-light)", fontSize: 10 }}>{v.type}</span>
                          <span style={{ fontSize: 10 }}>{DIRECTION_ICON[v.direction]}</span>
                        </span>
                      ))}
                      {t.variables.length === 0 && <span style={{ fontSize: 12, color: "var(--text-light)" }}>No variables</span>}
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ padding: "10px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--text-light)" }}>Modified {t.lastModified}</span>
                    <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); setSelectedThing(t); }}>
                      <Settings size={12} /> Open
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
