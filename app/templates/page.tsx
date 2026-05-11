"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { FileText, Plus, MoreHorizontal, Search } from "lucide-react";

const TEMPLATES = [
  { id: "tp1", name: "Weather Station", desc: "Monitor temperature, humidity and pressure", type: "ESP32", difficulty: "Beginner", widgets: 4 },
  { id: "tp2", name: "Smart Garden", desc: "Automated watering and soil monitoring", type: "ESP32", difficulty: "Intermediate", widgets: 6 },
  { id: "tp3", name: "Home Automation", desc: "Control lights, fans and appliances", type: "ESP32", difficulty: "Advanced", widgets: 8 },
  { id: "tp4", name: "Green House Monitor", desc: "Complete greenhouse environment control", type: "ESP32", difficulty: "Intermediate", widgets: 7 },
];

export default function Templates() {
  const [search, setSearch] = useState("");

  const filtered = TEMPLATES.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1>Templates</h1>
          <div className="search-bar" style={{ width: 260 }}>
            <Search size={14} className="search-icon" />
            <input type="text" placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="dashboard-grid">
          {filtered.map((t) => (
            <div key={t.id} className="dashboard-card" style={{ cursor: "pointer" }}>
              <div className="dashboard-card-cover" style={{ background: "linear-gradient(135deg, #059669, #34d399)" }}>
                <FileText size={40} color="#fff" className="cover-icon" />
                <span style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "3px 8px", borderRadius: 4 }}>{t.difficulty}</span>
              </div>
              <div className="dashboard-card-body">
                <h3 style={{ margin: "0 0 4px", fontSize: 15 }}>{t.name}</h3>
                <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--text-light)" }}>{t.desc}</p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-light)" }}>
                  <span>{t.type}</span>
                  <span>{t.widgets} widgets</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
