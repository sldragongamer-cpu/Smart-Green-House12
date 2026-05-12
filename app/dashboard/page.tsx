"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import {
  Plus, MoreHorizontal, Copy, Trash2,
  LayoutDashboard, Thermometer, Cpu, Search, X,
} from "lucide-react";

interface Thing { id: string; name: string; variables: { name: string; type: string }[]; }
interface Dashboard {
  id: string; name: string; type: string; device: string;
  thingId: string; thingName: string;
  lastOpened: string; created: string;
  coverColor: string; icon: string; widgetCount: number;
}

const ICON_MAP: Record<string, React.ElementType> = { Cpu, Thermometer, LayoutDashboard };

export default function Dashboards() {
  const router = useRouter();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [things, setThings] = useState<Thing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newDash, setNewDash] = useState({ name: "", thingId: "" });

  async function fetchAll() {
    const [dRes, tRes] = await Promise.all([
      fetch("/api/dashboards").then((r) => r.json()),
      fetch("/api/things").then((r) => r.json()),
    ]);
    setDashboards(dRes);
    setThings(tRes);
    setLoading(false);
  }
  useEffect(() => { fetchAll(); }, []);

  const filtered = dashboards.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate() {
    if (!newDash.name.trim()) return;
    const thing = things.find((t) => t.id === newDash.thingId);
    const res = await fetch("/api/dashboards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newDash.name,
        thingId: newDash.thingId || "",
        thingName: thing?.name || "",
        device: thing?.name || "",
      }),
    });
    const dash = await res.json();
    setDashboards([dash, ...dashboards]);
    setShowCreate(false);
    setNewDash({ name: "", thingId: "" });
  }

  async function handleDuplicate(id: string) {
    const src = dashboards.find((d) => d.id === id);
    if (!src) return;
    const res = await fetch("/api/dashboards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `${src.name} (Copy)`, thingId: src.thingId, thingName: src.thingName }),
    });
    const copy = await res.json();
    setDashboards([copy, ...dashboards]);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/dashboards/${id}`, { method: "DELETE" });
    setDashboards((p) => p.filter((d) => d.id !== id));
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
          <h1>Dashboards</h1>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> Create Dashboard
          </button>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div className="search-bar">
            <Search className="search-icon" size={16} />
            <input type="text" placeholder="Search dashboards..." value={search}
              onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {showCreate && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
               onClick={() => setShowCreate(false)}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 32, width: 440, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
                 onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Create Dashboard</h2>
                <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6c757d", padding: 4 }}><X size={20} /></button>
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Dashboard Name</label>
                <input type="text" placeholder="e.g. Weather Station" value={newDash.name}
                  onChange={(e) => setNewDash({ ...newDash, name: e.target.value })}
                  autoFocus onKeyDown={(e) => e.key === "Enter" && handleCreate()} />
              </div>
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label>Associated Thing</label>
                <select value={newDash.thingId} onChange={(e) => setNewDash({ ...newDash, thingId: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 14, fontFamily: "inherit", background: "#fff" }}>
                  <option value="">— No Thing —</option>
                  {things.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.variables.map((v) => v.name).join(", ")})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn" onClick={() => setShowCreate(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleCreate}>Create</button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-light)" }}>Loading...</div>
        ) : (
          <div className="dashboard-grid">
            {filtered.map((dash) => {
              const Icon = ICON_MAP[dash.icon] || LayoutDashboard;
              return (
                <DashboardCard
                  key={dash.id} dash={dash} icon={Icon}
                  onOpen={() => router.push(`/dashboard/${dash.id}`)}
                  onDuplicate={() => handleDuplicate(dash.id)}
                  onDelete={() => handleDelete(dash.id)}
                />
              );
            })}
            {filtered.length === 0 && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 60, color: "var(--text-light)" }}>
                <p style={{ fontSize: 15, margin: 0 }}>No dashboards found</p>
                <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setShowCreate(true)}>
                  <Plus size={14} /> Create one
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function DashboardCard({ dash, icon: Icon, onOpen, onDuplicate, onDelete }: {
  dash: Dashboard; icon: React.ElementType; onOpen: () => void; onDuplicate: () => void; onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="dashboard-card" onClick={onOpen}>
      <div className="dashboard-card-cover" style={{ background: `linear-gradient(135deg, ${dash.coverColor}, ${dash.coverColor}88)` }}>
        <Icon className="cover-icon" size={48} color="#fff" />
        <span style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", padding: "3px 8px", borderRadius: 4 }}>
          {dash.type}
        </span>
      </div>
      <div className="dashboard-card-body">
        <div className="card-header">
          <h3>{dash.name}</h3>
          <div className="card-menu-wrapper" onClick={(e) => e.stopPropagation()}>
            <button className="card-menu" onClick={() => setMenuOpen(!menuOpen)}>
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <div className="card-dropdown">
                <button onClick={() => { onDuplicate(); setMenuOpen(false); }}>
                  <Copy size={13} /> Duplicate
                </button>
                <button className="danger" onClick={() => { onDelete(); setMenuOpen(false); }}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="card-meta">
          <span>Thing: {dash.thingName || dash.device}</span>
          <span>Last opened: {dash.lastOpened}</span>
          <span>Created: {dash.created}</span>
          <span style={{ color: "var(--teal)", fontWeight: 500, marginTop: 4 }}>
            {dash.widgetCount} widgets
          </span>
        </div>
      </div>
    </div>
  );
}
