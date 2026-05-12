"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { Cpu, Wifi, WifiOff, Plus, X, Trash2, RefreshCw } from "lucide-react";

const DEVICE_TYPES = ["ESP32", "ESP8266", "UNO R4 WiFi", "MKR WiFi 1010", "Nano RP2040 Connect", "Portenta H7"];

interface Device {
  id: string;
  name: string;
  type: string;
  status: string;
  lastSeen: string;
  ip: string;
  thing: string;
  autoRegistered?: boolean;
}

export default function Devices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newDev, setNewDev] = useState({ name: "", type: "ESP32" });

  const fetchDevices = useCallback(async () => {
    const res = await fetch("/api/devices");
    const data = await res.json();
    setDevices(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchDevices(); }, [fetchDevices]);

  // Poll every 5s to update online/offline status
  useEffect(() => {
    const iv = setInterval(fetchDevices, 5000);
    return () => clearInterval(iv);
  }, [fetchDevices]);

  async function handleAdd() {
    if (!newDev.name.trim()) return;
    const res = await fetch("/api/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDev),
    });
    const device = await res.json();
    setDevices([...devices, device]);
    setShowAdd(false);
    setNewDev({ name: "", type: "ESP32" });
  }

  async function handleDelete(id: string) {
    await fetch(`/api/devices/${id}`, { method: "DELETE" });
    setDevices(devices.filter((d) => d.id !== id));
  }

  const onlineCount = devices.filter((d) => d.status === "online").length;

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
          <h1>Devices</h1>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-sm" onClick={fetchDevices} title="Refresh">
              <RefreshCw size={14} />
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
              <Plus size={14} /> Add Device
            </button>
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <h2>My Devices</h2>
            <span style={{ fontSize: 13, color: "var(--text-light)" }}>
              {onlineCount} online / {devices.length} total
            </span>
          </div>
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
                  {loading ? (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--text-light)" }}>Loading...</td></tr>
                  ) : devices.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--text-light)" }}>
                      No devices yet. <strong>Connect an ESP32</strong> — it will appear here automatically when it starts sending sensor data.
                    </td></tr>
                  ) : devices.map((d) => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 500 }}>
                        <Cpu size={14} style={{ marginRight: 6, color: "var(--teal)" }} />
                        {d.name}
                        {d.autoRegistered && (
                          <span style={{ marginLeft: 6, fontSize: 10, background: "rgba(0,151,157,0.1)", color: "var(--teal)", padding: "1px 6px", borderRadius: 3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px" }}>
                            Auto
                          </span>
                        )}
                      </td>
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
                        <button className="card-menu" onClick={() => handleDelete(d.id)} title="Delete">
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

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
             onClick={() => setShowAdd(false)}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 32, width: 440, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
               onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Add Device</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6c757d", padding: 4 }}><X size={20} /></button>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Device Name</label>
              <input type="text" placeholder="e.g. Living Room Sensor" value={newDev.name}
                onChange={(e) => setNewDev({ ...newDev, name: e.target.value })}
                autoFocus onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label>Device Type</label>
              <select value={newDev.type} onChange={(e) => setNewDev({ ...newDev, type: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 14, fontFamily: "inherit", background: "#fff" }}>
                {DEVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Add Device</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
