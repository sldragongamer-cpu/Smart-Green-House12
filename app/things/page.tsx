"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Plus, X } from "lucide-react";

interface Thing {
  id: number;
  name: string;
  device: string;
  sketch: string;
  lastModified: string;
  created: string;
  variables: string[];
}

export default function Things() {
  const [things, setThings] = useState<Thing[]>([
    {
      id: 1,
      name: "Green House Variables",
      device: "Green House",
      sketch: "Green_House_Vari...",
      lastModified: "Aug 14, 2025, 8:25 AM",
      created: "Aug 11, 2025, 6:23 PM",
      variables: ["temperature", "humidity"],
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newThing, setNewThing] = useState<Thing>({
    id: Date.now(),
    name: "",
    device: "",
    sketch: "",
    lastModified: new Date().toLocaleString(),
    created: new Date().toLocaleString(),
    variables: [],
  });
  const [variableInput, setVariableInput] = useState("");

  function handleAddThing() {
    setThings([...things, { ...newThing, id: Date.now() }]);
    setNewThing({
      id: Date.now(), name: "", device: "", sketch: "",
      lastModified: new Date().toLocaleString(),
      created: new Date().toLocaleString(),
      variables: [],
    });
    setShowForm(false);
  }

  function handleAddVariable() {
    if (variableInput.trim() !== "") {
      setNewThing({
        ...newThing,
        variables: [...newThing.variables, variableInput.trim()],
      });
      setVariableInput("");
    }
  }

  function removeVariable(idx: number) {
    setNewThing({
      ...newThing,
      variables: newThing.variables.filter((_, i) => i !== idx),
    });
  }

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
          <h1>Things</h1>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={14} />
            Create Thing
          </button>
        </div>

        {showForm && (
          <div className="form-overlay">
            <div className="form-grid">
              <div className="form-group">
                <label>Thing Name</label>
                <input
                  type="text"
                  placeholder="e.g. Weather Station"
                  value={newThing.name}
                  onChange={(e) => setNewThing({ ...newThing, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Device</label>
                <input
                  type="text"
                  placeholder="e.g. ESP32"
                  value={newThing.device}
                  onChange={(e) => setNewThing({ ...newThing, device: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Sketch</label>
                <input
                  type="text"
                  placeholder="Sketch name"
                  value={newThing.sketch}
                  onChange={(e) => setNewThing({ ...newThing, sketch: e.target.value })}
                />
              </div>
            </div>

            <div className="variables-section">
              <label className="form-group">
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>
                  Variables
                </span>
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder="Add variable"
                  value={variableInput}
                  onChange={(e) => setVariableInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddVariable()}
                  style={{ flex: 1, padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none" }}
                />
                <button className="btn btn-sm" onClick={handleAddVariable}>Add</button>
              </div>
              <div className="variable-tags">
                {newThing.variables.map((v, i) => (
                  <span key={i} className="variable-tag">
                    {v}
                    <X size={12} style={{ cursor: "pointer" }} onClick={() => removeVariable(i)} />
                  </span>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleAddThing}>
              Save Thing
            </button>
          </div>
        )}

        <div className="section">
          <div className="section-header">
            <h2>All Things</h2>
          </div>
          <div className="section-body">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Thing Name</th>
                    <th>Device</th>
                    <th>Sketch</th>
                    <th>Variables</th>
                    <th>Last Modified</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {things.map((t) => (
                    <tr key={t.id}>
                      <td>{t.name}</td>
                      <td>{t.device}</td>
                      <td>{t.sketch}</td>
                      <td>{t.variables.join(", ")}</td>
                      <td>{t.lastModified}</td>
                      <td>{t.created}</td>
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
