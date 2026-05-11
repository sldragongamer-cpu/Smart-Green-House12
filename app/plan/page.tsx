"use client";

import Sidebar from "../components/Sidebar";
import { BarChart3, Check, AlertCircle } from "lucide-react";

const PLAN = {
  name: "Maker",
  devices: { used: 2, total: 2 },
  things: { used: 2, total: 3 },
  dataRetention: "1 year",
  dashboards: { used: 3, total: "Unlimited" },
  storage: { used: "12 KB", total: "100 MB" },
  features: [
    "Unlimited dashboards",
    "Unlimited widgets",
    "1 year data retention",
    "OTA updates",
    "Cloud Editor",
    "Webhook support",
  ],
};

export default function Plan() {
  const bar = (used: number, total: number | string, label: string) => {
    const pct = typeof total === "number" ? (used / total) * 100 : 0;
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
          <span style={{ color: "var(--text-light)" }}>{label}</span>
          <span style={{ fontWeight: 500 }}>{used}{typeof total === "number" ? ` / ${total}` : ` / ${total}`}</span>
        </div>
        {typeof total === "number" && (
          <div style={{ background: "#e5e7eb", borderRadius: 6, height: 8, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: pct > 80 ? "#ef4444" : "var(--teal)", borderRadius: 6 }} />
          </div>
        )}
      </div>
    );
  };

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
          <h1>Plan & Usage</h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div className="section">
            <div className="section-header">
              <h2><BarChart3 size={16} /> Usage</h2>
              <span className="badge" style={{ background: "#f0fdfe", color: "var(--teal)" }}>{PLAN.name} Plan</span>
            </div>
            <div className="section-body">
              {bar(PLAN.devices.used, PLAN.devices.total, "Devices")}
              {bar(PLAN.things.used, PLAN.things.total, "Things")}
              {bar(PLAN.dashboards.used, PLAN.dashboards.total, "Dashboards")}
              <div style={{ fontSize: 13, marginBottom: 4, color: "var(--text-light)" }}>Data Retention</div>
              <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 16 }}>{PLAN.dataRetention}</div>
              <div style={{ fontSize: 13, marginBottom: 4, color: "var(--text-light)" }}>Storage</div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{PLAN.storage.used} / {PLAN.storage.total}</div>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <h2><Check size={16} /> Plan Features</h2>
              <button className="btn btn-sm" onClick={() => {}}>Upgrade</button>
            </div>
            <div className="section-body">
              {PLAN.features.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", fontSize: 13 }}>
                  <Check size={14} style={{ color: "var(--teal)", flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
