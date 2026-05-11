"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Zap, Plus, ToggleLeft, ToggleRight, MoreHorizontal, Trash2, Copy } from "lucide-react";

const TRIGGERS = [
  { id: "t1", name: "High Temperature Alert", type: "Greater Than", variable: "temperature", threshold: "30", thing: "ESP32", active: true, lastFired: "2 min ago" },
  { id: "t2", name: "Fan Speed Control", type: "Less Than", variable: "temperature", threshold: "20", thing: "ESP32", active: true, lastFired: "1 hour ago" },
  { id: "t3", name: "Water Level Low", type: "Less Than", variable: "water", threshold: "20", thing: "Green House", active: false, lastFired: "Yesterday" },
];

export default function Triggers() {
  const [triggers, setTriggers] = useState(TRIGGERS);

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
          <h1>Triggers</h1>
          <button className="btn btn-primary btn-sm" onClick={() => {}}>
            <Plus size={14} /> Create Trigger
          </button>
        </div>

        <div className="section">
          <div className="section-header"><h2>All Triggers</h2></div>
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
                  {triggers.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 500 }}><Zap size={14} style={{ marginRight: 6, color: "var(--teal)" }} />{t.name}</td>
                      <td>{t.type} {t.threshold}</td>
                      <td>{t.variable}</td>
                      <td>{t.thing}</td>
                      <td>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          {t.active ? <><ToggleRight size={16} style={{ color: "var(--teal)" }} /> Active</> : <><ToggleLeft size={16} style={{ color: "#9ca3af" }} /> Disabled</>}
                        </span>
                      </td>
                      <td>{t.lastFired}</td>
                      <td>
                        <button className="card-menu" onClick={() => {}}>
                          <MoreHorizontal size={14} />
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
