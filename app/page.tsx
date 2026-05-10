"use client";

import { useEffect } from "react";
import { Chart } from "chart.js";
import { GridStack } from "gridstack";

export default function Home() {
  async function sendCommand(cmd: string) {
    await fetch("/api/control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: cmd }),
    });
  }

  useEffect(() => {
    GridStack.init({ float: true });

    const tempChart = new Chart(document.getElementById("tempChart") as HTMLCanvasElement, {
      type: "line",
      data: { labels: [], datasets: [{ label: "Temperature", data: [], borderColor: "#ff5733" }] },
    });

    const humidityChart = new Chart(document.getElementById("humidityChart") as HTMLCanvasElement, {
      type: "line",
      data: { labels: [], datasets: [{ label: "Humidity", data: [], borderColor: "#007bff" }] },
    });

    async function loadSensors() {
      const res = await fetch("/api/sensors");
      const data = await res.json();
      (document.getElementById("temp") as HTMLElement).innerText = data.temperature + " °C";
      (document.getElementById("humidity") as HTMLElement).innerText = data.humidity + " %";
    }

    setInterval(loadSensors, 3000);
  }, []);

  return (
    <main>
      <h1>ESP32 Cloud Dashboard</h1>
      <p id="temp">-- °C</p>
      <canvas id="tempChart"></canvas>
      <p id="humidity">-- %</p>
      <canvas id="humidityChart"></canvas>
      <button onClick={() => sendCommand("light:on")}>Light On</button>
      <button onClick={() => sendCommand("light:off")}>Light Off</button>
    </main>
  );
}
