"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Cpu, Wifi, WifiOff, MoreHorizontal, Copy, Trash2, Plus } from "lucide-react";

const DEVICES = [
  { id: "esp32-1", name: "ESP32 Dev Board", type: "ESP32", status: "online", lastSeen: "Just now", ip: "192.168.1.42", thing: "ESP32" },
  { id: "esp32-2", name: "Green House Sensor", type: "ESP32", status: "online", lastSeen: "2 min ago", ip: "192.168.1.43", thing: "Green House" },
  { id: "uno-1", name: "Arduino Uno R4", type: "UNO R4 WiFi", status: "offline", lastSeen: "3 hours ago", ip: "—", thing: "Green House Variables" },
];

export default function Devices() {
  const [devices, setDevices] = useState(DEVICES);
  const [showAdd, setShowAdd] = useState(false);

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
          <h1>Devices</h1>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Add Device
          </button>
        </div>

        <div className="section">
          <div className="section-header"><h2>My Devices</h2></div>
          <div className="section-body">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Last Seen</th>
                    <th>Thing</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((d) => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 500 }}><Cpu size={14} style={{ marginRight: 6, color: "var(--teal)" }} />{d.name}</td>
                      <td>{d.type}</td>
                      <td>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.status === "online" ? "#22c55e" : "#9ca3af", display: "inline-block" }} />
                          {d.status === "online" ? <><Wifi size={12} /> Online</> : <><WifiOff size={12} /> Offline</>}
                        </span>
                      </td>
                      <td>{d.lastSeen}</td>
                      <td>{d.thing}</td>
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
