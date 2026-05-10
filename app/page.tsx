"use client";

import { useEffect, useRef, useState } from "react";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.min.css";

type Widget = {
  id: number;
  type: "chart" | "switch" | "slider" | "gauge" | "value";
};

export default function Dashboard() {
  const gridRef = useRef<GridStack | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: 1, type: "chart" },
    { id: 2, type: "switch" },
  ]);

  useEffect(() => {
    const grid = GridStack.init({
      float: true,
      resizable: { handles: "all" },
      draggable: { handle: ".grid-stack-item-content" },
      cellHeight: 120,
      margin: 10,
    });
    gridRef.current = grid;

    // Load saved layout
    const saved = localStorage.getItem("layout");
    if (saved) {
      setWidgets(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Save layout whenever widgets change
    localStorage.setItem("layout", JSON.stringify(widgets));
  }, [widgets]);

  function addWidget(type: Widget["type"]) {
    setWidgets([...widgets, { id: Date.now(), type }]);
  }

  return (
    <main style={{ backgroundColor: "white", minHeight: "100vh", padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>ESP32 Cloud Dashboard</h1>

      {/* Add Widget Controls */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button onClick={() => addWidget("chart")}>+ Chart</button>
        <button onClick={() => addWidget("switch")}>+ Switch</button>
        <button onClick={() => addWidget("slider")}>+ Slider</button>
        <button onClick={() => addWidget("gauge")}>+ Gauge</button>
        <button onClick={() => addWidget("value")}>+ Value</button>
      </div>

      {/* Grid Layout */}
      <div className="grid-stack">
        {widgets.map((w, i) => (
          <div
            key={w.id}
            className="grid-stack-item"
            data-gs-x={i % 3}
            data-gs-y={Math.floor(i / 3)}
            data-gs-w="3"
            data-gs-h="3"
          >
            <div className="grid-stack-item-content">
              {w.type === "chart" && (
                <>
                  <h2>📊 Chart</h2>
                  <canvas></canvas>
                </>
              )}
              {w.type === "switch" && (
                <>
                  <h2>💡 Switch</h2>
                  <button>On</button>
                  <button>Off</button>
                </>
              )}
              {w.type === "slider" && (
                <>
                  <h2>🌀 Slider</h2>
                  <input type="range" min="0" max="100" defaultValue="0" />
                </>
              )}
              {w.type === "gauge" && (
                <>
                  <h2>📈 Gauge</h2>
                  <p>-- %</p>
                </>
              )}
              {w.type === "value" && (
                <>
                  <h2>🔢 Value</h2>
                  <p>--</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
