"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Code, Plus, MoreHorizontal, Play, Download } from "lucide-react";

const SKETCHES = [
  { id: "sk1", name: "esp32_cloud.ino", thing: "ESP32", updated: "May 10, 2026", size: "2.4 KB" },
  { id: "sk2", name: "greenhouse_sensors.ino", thing: "Green House", updated: "May 9, 2026", size: "3.1 KB" },
  { id: "sk3", name: "variables_aug11a.ino", thing: "Green House Variables", updated: "Aug 11, 2025", size: "1.8 KB" },
];

export default function Sketches() {
  const [sketches] = useState(SKETCHES);

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
          <h1>Sketches</h1>
          <button className="btn btn-primary btn-sm" onClick={() => {}}>
            <Plus size={14} /> New Sketch
          </button>
        </div>

        <div className="section">
          <div className="section-header"><h2>My Sketches</h2></div>
          <div className="section-body">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Thing</th>
                    <th>Updated</th>
                    <th>Size</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {sketches.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500 }}><Code size={14} style={{ marginRight: 6, color: "var(--teal)" }} />{s.name}</td>
                      <td>{s.thing}</td>
                      <td>{s.updated}</td>
                      <td>{s.size}</td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button className="btn btn-sm" style={{ padding: "4px 8px" }}><Play size={12} /></button>
                          <button className="btn btn-sm" style={{ padding: "4px 8px" }}><Download size={12} /></button>
                          <button className="card-menu" onClick={() => {}}><MoreHorizontal size={14} /></button>
                        </div>
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
