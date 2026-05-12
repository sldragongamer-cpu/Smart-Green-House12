"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Zap, Plus, ToggleLeft, ToggleRight, Trash2, X } from "lucide-react";

interface Thing { id: string; name: string; variables: { name: string; type: string }[]; }
interface Trigger {
  id: string; name: string; type: "Greater Than" | "Less Than" | "Equal To";
  variable: string; threshold: string; thing: string; active: boolean; lastFired: string;
}

const CONDITION_TYPES = ["Greater Than", "Less Than", "Equal To"];

export default function Triggers() {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [things, setThings] = useState<Thing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", thingId: "", variable: "", type: "Greater Than" as Trigger["type"], threshold: "0" });

  async function fetchTriggers() {
    const [tRes, thingsRes] = await Promise.all([
      fetch("/api/triggers").then((r) => r.json()),
      fetch("/api/things").then((r) => r.json()),
    ]);
    setTriggers(tRes);
    setThings(thingsRes);
    setLoading(false);
  }
  useEffect(() => { fetchTriggers(); }, []);

  const selectedThing = things.find((t) => t.id === form.thingId);

  async function handleCreate() {
    if (!form.name.trim() || !form.variable) return;
    const res = await fetch("/api/triggers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        type: form.type,
        variable: form.variable,
        threshold: form.threshold,
        thing: selectedThing?.name || "",
        active: true,
      }),
    });
    const trigger = await res.json();
    setTriggers([...triggers, trigger]);
    setShowCreate(false);
    setForm({ name: "", thingId: "", variable: "", type: "Greater Than", threshold: "0" });
  }

  async function toggleActive(id: string, current: boolean) {
    const res = await fetch(`/api/triggers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !current }),
    });
    const updated = await res.json();
    setTriggers(triggers.map((t) => t.id === id ? updated : t));
  }

  async function handleDelete(id: string) {
    await fetch(`/api/triggers/${id}`, { method: "DELETE" });
    setTriggers(triggers.filter((t) => t.id !== id));
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
      <main className="content">
        <div className="page-header">
          <h1>Triggers</h1>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> Create Trigger
          </button>
        </div>

        {showCreate && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
               onClick={() => setShowCreate(false)}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 32, width: 480, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
                 onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Create Trigger</h2>
                <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6c757d", padding: 4 }}><X size={20} /></button>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Trigger Name</label>
                <input type="text" placeholder="e.g. High Temperature Alert" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Thing</label>
                <select value={form.thingId} onChange={(e) => {
                  setForm({ ...form, thingId: e.target.value, variable: "" });
                }}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 14, fontFamily: "inherit", background: "#fff" }}>
                  <option value="">Select a Thing</option>
                  {things.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Condition</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Trigger["type"] })}
                    style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 14, fontFamily: "inherit", background: "#fff" }}>
                    {CONDITION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input type="number" placeholder="Threshold" value={form.threshold}
                    onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                    style={{ width: 120, padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 14, fontFamily: "inherit" }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 24 }}>
                <label>Variable</label>
                <select value={form.variable} onChange={(e) => setForm({ ...form, variable: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 14, fontFamily: "inherit", background: "#fff" }}>
                  <option value="">Select variable</option>
                  {selectedThing?.variables.map((v) => (
                    <option key={v.name} value={v.name}>{v.name} ({v.type})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn" onClick={() => setShowCreate(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleCreate}>Create Trigger</button>
              </div>
            </div>
          </div>
        )}

        <div className="section">
          <div className="section-header">
            <h2>All Triggers</h2>
            <span style={{ fontSize: 13, color: "var(--text-light)" }}>{triggers.filter((t) => t.active).length} active / {triggers.length} total</span>
          </div>
          <div className="section-body">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Condition</th>
                    <th>Variable</th>
                    <th>Thing</th>
                    <th>Status</th>
                    <th>Last Fired</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--text-light)" }}>Loading...</td></tr>
                  ) : triggers.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--text-light)" }}>
                      No triggers yet. Create one to get notified when sensor values cross thresholds.
                    </td></tr>
                  ) : triggers.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 500 }}><Zap size={14} style={{ marginRight: 6, color: "var(--teal)" }} />{t.name}</td>
                      <td>
                        <span style={{ background: "rgba(0,151,157,0.08)", color: "var(--teal)", padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                          {t.type} {t.threshold}
                        </span>
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: 12 }}>{t.variable}</td>
                      <td>{t.thing}</td>
                      <td>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }} onClick={() => toggleActive(t.id, t.active)}>
                          {t.active ? <><ToggleRight size={16} style={{ color: "var(--teal)" }} /> Active</> : <><ToggleLeft size={16} style={{ color: "#9ca3af" }} /> Disabled</>}
                        </span>
                      </td>
                      <td>{t.lastFired}</td>
                      <td>
                        <button className="card-menu" onClick={() => handleDelete(t.id)} title="Delete">
                          <Trash2 size={14} style={{ color: "#ef4444" }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
