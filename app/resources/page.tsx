"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { BookText, Search, ExternalLink, FileText, Video, BookOpen } from "lucide-react";

const RESOURCES = [
  { id: "r1", title: "Arduino Cloud API Reference", type: "Documentation", icon: FileText, url: "#" },
  { id: "r2", title: "Getting Started with ESP32", type: "Tutorial", icon: BookOpen, url: "#" },
  { id: "r3", title: "Dashboard Widgets Guide", type: "Guide", icon: BookText, url: "#" },
  { id: "r4", title: "Over-the-Air Updates", type: "Video", icon: Video, url: "#" },
  { id: "r5", title: "MQTT Protocol Overview", type: "Documentation", icon: FileText, url: "#" },
  { id: "r6", title: "Sensor Calibration Techniques", type: "Tutorial", icon: BookOpen, url: "#" },
];

export default function Resources() {
  const [search, setSearch] = useState("");
  const filtered = RESOURCES.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()));

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
          <h1>Resources</h1>
          <div className="search-bar" style={{ width: 260 }}>
            <Search size={14} className="search-icon" />
            <input type="text" placeholder="Search resources..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="section">
          <div className="section-body" style={{ padding: 0 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {filtered.map((r) => {
                const Icon = r.icon;
                return (
                  <a key={r.id} href={r.url} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: "1px solid var(--border)", textDecoration: "none", color: "inherit", transition: "background 0.15s" }}
                     onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                     onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f0fdfe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={18} style={{ color: "var(--teal)" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{r.title}</div>
                      <div style={{ fontSize: 12, color: "var(--text-light)" }}>{r.type}</div>
                    </div>
                    <ExternalLink size={14} style={{ color: "var(--text-light)" }} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
