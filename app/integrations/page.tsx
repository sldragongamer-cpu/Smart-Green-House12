"use client";

import Sidebar from "../components/Sidebar";
import { Puzzle, ExternalLink, ArrowRight } from "lucide-react";

const INTEGRATIONS = [
  { id: "i1", name: "IFTTT", desc: "Connect your devices to hundreds of services", status: "Connected", color: "#1a1a2e" },
  { id: "i2", name: "Google Assistant", desc: "Control your devices with voice commands", status: "Available", color: "#4285f4" },
  { id: "i3", name: "Amazon Alexa", desc: "Voice control for your smart devices", status: "Available", color: "#ff9900" },
  { id: "i4", name: "Node-RED", desc: "Flow-based visual programming for IoT", status: "Connected", color: "#8f0000" },
  { id: "i5", name: "Zapier", desc: "Automate workflows across apps", status: "Available", color: "#ff4a00" },
  { id: "i6", name: "Home Assistant", desc: "Local home automation platform", status: "Available", color: "#03a9f4" },
];

export default function Integrations() {
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
          <h1>Integrations</h1>
        </div>

        <div className="dashboard-grid">
          {INTEGRATIONS.map((i) => (
            <div key={i.id} className="dashboard-card" style={{ cursor: "pointer" }}>
              <div className="dashboard-card-cover" style={{ background: i.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Puzzle size={40} color="#fff" className="cover-icon" />
                <span style={{ position: "absolute", top: 12, right: 12, background: i.status === "Connected" ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.2)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4 }}>
                  {i.status}
                </span>
              </div>
              <div className="dashboard-card-body">
                <h3 style={{ margin: "0 0 4px", fontSize: 15 }}>{i.name}</h3>
                <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--text-light)" }}>{i.desc}</p>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: 12, color: "var(--teal)", display: "flex", alignItems: "center", gap: 4 }}>
                    Configure <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
