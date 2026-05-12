"use client";

import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import { FileText, BookOpen, Globe, LayoutDashboard, Thermometer, Droplets, Activity, Lightbulb, Fan } from "lucide-react";

export default function Home() {
  const [stats, setStats] = useState({ devices: 0, devicesOnline: 0, things: 0, triggers: 0 });
  const [sensors, setSensors] = useState({ temperature: 0, humidity: 0, light: false, fan: 0, water: 0 });

  useEffect(() => {
    async function fetchData() {
      try {
        const [devices, things, triggers, sensorRes] = await Promise.all([
          fetch("/api/devices").then((r) => r.json()),
          fetch("/api/things").then((r) => r.json()),
          fetch("/api/triggers").then((r) => r.json()),
          fetch("/api/sensors").then((r) => r.json()),
        ]);
        setStats({
          devices: devices.length,
          devicesOnline: devices.filter((d: any) => d.status === "online").length,
          things: things.length,
          triggers: triggers.filter((t: any) => t.active).length,
        });
        setSensors(sensorRes);
      } catch {}
    }
    fetchData();
    const iv = setInterval(fetchData, 5000);
    return () => clearInterval(iv);
  }, []);

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
          <h1>Home</h1>
          <div className="header-stats">
            <span>Devices <span className="stat-value">{stats.devicesOnline}/{stats.devices} online</span></span>
            <span>Things <span className="stat-value">{stats.things}</span></span>
            <span>Active Triggers <span className="stat-value">{stats.triggers}</span></span>
          </div>
        </div>

        {/* Live sensor cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
          <div className="section" style={{ margin: 0 }}>
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(231,76,60,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Thermometer size={20} style={{ color: "#e74c3c" }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>Temperature</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{sensors.temperature}°C</div>
              </div>
            </div>
          </div>
          <div className="section" style={{ margin: 0 }}>
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(0,151,157,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Droplets size={20} style={{ color: "var(--teal)" }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>Humidity</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{sensors.humidity}%</div>
              </div>
            </div>
          </div>
          <div className="section" style={{ margin: 0 }}>
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(46,204,113,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Activity size={20} style={{ color: "#2ecc71" }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>Water Level</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{sensors.water}%</div>
              </div>
            </div>
          </div>
          <div className="section" style={{ margin: 0 }}>
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(241,196,15,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Lightbulb size={20} style={{ color: sensors.light ? "#f1c40f" : "#9ca3af" }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>Light</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{sensors.light ? "ON" : "OFF"}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="section">
          <div className="section-header"><h2>Recent Sketches</h2></div>
          <div className="section-body">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Thing</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>esp32_cloud.ino</td><td>ESP32</td><td>May 10, 2026</td></tr>
                  <tr><td>greenhouse_sensors.ino</td><td>Green House</td><td>May 9, 2026</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="section">
          <div className="section-header"><h2>Documentation</h2></div>
          <div className="section-body">
            <ul className="docs-list">
              <li><FileText size={16} /> Hardware documentation</li>
              <li><BookOpen size={16} /> Discover our tutorials</li>
              <li><Globe size={16} /> Arduino Cloud APIs</li>
              <li><LayoutDashboard size={16} /> Cloud Dashboards &amp; Widgets</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
