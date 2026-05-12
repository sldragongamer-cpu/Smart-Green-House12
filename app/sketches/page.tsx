"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Code, Plus, MoreHorizontal, Play, Download, Trash2 } from "lucide-react";

interface Sketch {
  id: string;
  name: string;
  thing: string;
  updated: string;
  size: string;
  content: string;
}

export default function Sketches() {
  const [sketches, setSketches] = useState<Sketch[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchSketches() {
    const res = await fetch("/api/sketches");
    const data = await res.json();
    setSketches(data);
    setLoading(false);
  }
  useEffect(() => { fetchSketches(); }, []);

  async function handleDelete(id: string) {
    await fetch(`/api/sketches/${id}`, { method: "DELETE" });
    setSketches(sketches.filter((s) => s.id !== id));
  }

  function handleDownload(sketch: Sketch) {
    const blob = new Blob([sketch.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = sketch.name;
    a.click();
    URL.revokeObjectURL(url);
  }

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
          <h1>Sketches</h1>
          <button className="btn btn-primary btn-sm" onClick={() => {}}>
            <Plus size={14} /> New Sketch
          </button>
        </div>

        <div className="section">
          <div className="section-header">
            <h2>My Sketches</h2>
            <span style={{ fontSize: 13, color: "var(--text-light)" }}>{sketches.length} total</span>
          </div>
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
                  {loading ? (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--text-light)" }}>Loading...</td></tr>
                  ) : sketches.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--text-light)" }}>No sketches yet.</td></tr>
                  ) : sketches.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500 }}><Code size={14} style={{ marginRight: 6, color: "var(--teal)" }} />{s.name}</td>
                      <td>{s.thing}</td>
                      <td>{s.updated}</td>
                      <td>{s.size}</td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button className="btn btn-sm" style={{ padding: "4px 8px" }} title="Run"><Play size={12} /></button>
                          <button className="btn btn-sm" style={{ padding: "4px 8px" }} title="Download" onClick={() => handleDownload(s)}><Download size={12} /></button>
                          <button className="card-menu" onClick={() => handleDelete(s.id)} title="Delete">
                            <Trash2 size={14} style={{ color: "#ef4444" }} />
                          </button>
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
