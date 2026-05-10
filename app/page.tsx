"use client"; // allows browser-side JS

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Initialize Gridstack
    const grid = (window as any).GridStack?.init({
      float: true,
      resizable: { handles: "all" },
      draggable: { handle: ".grid-stack-item-content" },
    });

    async function loadSensors() {
      const res = await fetch("/api/sensors");
      const data = await res.json();
      (document.getElementById("temp") as HTMLElement).innerText =
        data.temperature + " °C";
      (document.getElementById("humidity") as HTMLElement).innerText =
        data.humidity + " %";
      const waterBar = document.getElementById("waterBar") as HTMLElement;
      waterBar.style.width = data.wlevel + "%";
      waterBar.innerText = data.wlevel + "%";

      tempChart.data.labels.push(new Date().toLocaleTimeString());
      tempChart.data.datasets[0].data.push(data.temperature);
      tempChart.update();

      humidityChart.data.labels.push(new Date().toLocaleTimeString());
      humidityChart.data.datasets[0].data.push(data.humidity);
      humidityChart.update();
    }

    async function sendCommand(cmd: string) {
      await fetch("/api/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
    }

    const fanSlider = document.getElementById("fanSlider") as HTMLInputElement;
    if (fanSlider) {
      fanSlider.addEventListener("input", () => {
        (document.getElementById("fanValue") as HTMLElement).innerText =
          fanSlider.value + "%";
        sendCommand("fan:" + fanSlider.value);
      });
    }

    const tempChart = new (window as any).Chart(
      document.getElementById("tempChart"),
      {
        type: "line",
        data: {
          labels: [],
          datasets: [
            { label: "Temperature", data: [], borderColor: "#ff5733" },
          ],
        },
      }
    );
    const humidityChart = new (window as any).Chart(
      document.getElementById("humidityChart"),
      {
        type: "line",
        data: {
          labels: [],
          datasets: [{ label: "Humidity", data: [], borderColor: "#007bff" }],
        },
      }
    );

    setInterval(loadSensors, 3000);
  }, []);

  return (
    <main style={{ padding: "20px", fontFamily: "Roboto, Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        ESP32 Cloud Dashboard
      </h1>

      <div className="grid-stack">
        {/* Temperature Widget */}
        <div className="grid-stack-item" data-gs-x="0" data-gs-y="0" data-gs-w="3" data-gs-h="3">
          <div className="grid-stack-item-content">
            <h2>🌡️ Temperature</h2>
            <p id="temp">-- °C</p>
            <canvas id="tempChart"></canvas>
          </div>
        </div>

        {/* Humidity Widget */}
        <div className="grid-stack-item" data-gs-x="3" data-gs-y="0" data-gs-w="3" data-gs-h="3">
          <div className="grid-stack-item-content">
            <h2>💧 Humidity</h2>
            <p id="humidity">-- %</p>
            <canvas id="humidityChart"></canvas>
          </div>
        </div>

        {/* Fan Speed Slider */}
        <div className="grid-stack-item" data-gs-x="0" data-gs-y="3" data-gs-w="3" data-gs-h="2">
          <div className="grid-stack-item-content">
            <h2>🌀 Fan Speed</h2>
            <input type="range" min="0" max="100" defaultValue="0" id="fanSlider" />
            <p className="slider-value" id="fanValue">0%</p>
          </div>
        </div>

        {/* Light Switch */}
        <div className="grid-stack-item" data-gs-x="3" data-gs-y="3" data-gs-w="3" data-gs-h="2">
          <div className="grid-stack-item-content">
            <h2>💡 Light</h2>
            <button className="switch" onClick={() => sendCommand("light:on")}>On</button>
            <button className="switch off" onClick={() => sendCommand("light:off")}>Off</button>
          </div>
        </div>

        {/* Water Level */}
        <div className="grid-stack-item" data-gs-x="6" data-gs-y="0" data-gs-w="3" data-gs-h="2">
          <div className="grid-stack-item-content">
            <h2>💦 Water Level</h2>
            <div className="progress">
              <div className="progress-bar" id="waterBar" style={{ width: "0%" }}>0%</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
