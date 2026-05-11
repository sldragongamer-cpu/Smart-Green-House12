"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import {
  Plus,
  MoreHorizontal,
  Copy,
  Trash2,
  LayoutDashboard,
  Thermometer,
  Cpu,
  Search,
  X,
} from "lucide-react";

interface Dashboard {
  id: string;
  name: string;
  type: string;
  device: string;
  lastOpened: string;
  created: string;
  coverColor: string;
  icon: string;
  widgetCount: number;
}

const DASHBOARDS: Dashboard[] = [
  {
    id: "esp32-main",
    name: "ESP32",
    type: "Custom",
    device: "ESP32 Device",
    lastOpened: "May 10, 2026, 9:50 PM",
    created: "May 10, 2026",
    coverColor: "#00979d",
    icon: "Cpu",
    widgetCount: 5,
  },
  {
    id: "greenhouse",
    name: "Green House",
    type: "Custom",
    device: "Green House",
    lastOpened: "May 10, 2026, 11:49 PM",
    created: "May 10, 2026",
    coverColor: "#2ecc71",
    icon: "Thermometer",
    widgetCount: 3,
  },
  {
    id: "greenhouse-vars",
    name: "Green House Variables",
    type: "Template",
    device: "Green House",
    lastOpened: "May 7, 2026, 5:29 PM",
    created: "Aug 11, 2025",
    coverColor: "#9b59b6",
    icon: "LayoutDashboard",
    widgetCount: 4,
  },
];

const ICON_MAP: Record<string, React.ElementType> = {
  Cpu,
  Thermometer,
  LayoutDashboard,
};

export default function Dashboards() {
  const router = useRouter();
  const [dashboards, setDashboards] = useState<Dashboard[]>(DASHBOARDS);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newDash, setNewDash] = useState({ name: "", device: "" });

  const filtered = dashboards.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleCreate() {
    if (!newDash.name.trim()) return;
    const dash: Dashboard = {
      id: `dash-${Date.now()}`,
      name: newDash.name,
      type: "Custom",
      device: newDash.device || "—",
      lastOpened: new Date().toLocaleString(),
      created: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      coverColor: ["#00979d", "#2ecc71", "#e74c3c", "#f39c12", "#9b59b6"][Math.floor(Math.random() * 5)],
      icon: "LayoutDashboard",
      widgetCount: 0,
    };
    setDashboards([dash, ...dashboards]);
    setShowCreate(false);
    setNewDash({ name: "", device: "" });
  }

  function handleDuplicate(id: string) {
    const src = dashboards.find((d) => d.id === id);
    if (!src) return;
    const copy: Dashboard = {
      ...src,
      id: `dash-${Date.now()}`,
      name: `${src.name} (Copy)`,
      lastOpened: new Date().toLocaleString(),
      created: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    };
    setDashboards([copy, ...dashboards]);
  }

  function handleDelete(id: string) {
    setDashboards((p) => p.filter((d) => d.id !== id));
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
            <input
              type="text"
              placeholder="Search dashboards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Create Dashboard Modal */}
        {showCreate && (
          <div
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 9999,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onClick={() => setShowCreate(false)}
          >
            <div
              style={{
                background: "#fff", borderRadius: 12, padding: 32, width: 440,
                maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Create Dashboard</h2>
                <button
                  onClick={() => setShowCreate(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#6c757d", padding: 4 }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Dashboard Name</label>
                <input
                  type="text"
                  placeholder="e.g. Weather Station"
                  value={newDash.name}
                  onChange={(e) => setNewDash({ ...newDash, name: e.target.value })}
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 24 }}>
                <label>Associated Device (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. ESP32"
                  value={newDash.device}
                  onChange={(e) => setNewDash({ ...newDash, device: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn" onClick={() => setShowCreate(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleCreate}>Create</button>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-grid">
          {filtered.map((dash) => {
            const Icon = ICON_MAP[dash.icon] || LayoutDashboard;
            return (
              <DashboardCard
                key={dash.id}
                dash={dash}
                icon={Icon}
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
      </main>
    </div>
  );
}

function DashboardCard({
  dash,
  icon: Icon,
  onOpen,
  onDuplicate,
  onDelete,
}: {
  dash: Dashboard;
  icon: React.ElementType;
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="dashboard-card" onClick={onOpen}>
      <div className="dashboard-card-cover" style={{ background: `linear-gradient(135deg, ${dash.coverColor}, ${dash.coverColor}88)` }}>
        <Icon className="cover-icon" size={48} color="#fff" />
        <span
          style={{
            position: "absolute", top: 12, right: 12,
            background: "rgba(255,255,255,0.2)", color: "#fff",
            fontSize: 10, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.5px", padding: "3px 8px", borderRadius: 4,
          }}
        >
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
          <span>Device: {dash.device}</span>
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
