<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ESP32 Cloud Dashboard</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gridstack/dist/gridstack.min.css" />
  <script src="https://cdn.jsdelivr.net/npm/gridstack/dist/gridstack-all.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      font-family: "Roboto", Arial, sans-serif;
      background: #f0f2f5;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    h1 {
      text-align: center;
      font-weight: 500;
      margin-bottom: 30px;
    }
    .grid-stack {
      background: transparent;
    }
    .grid-stack-item-content {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .grid-stack-item-content h2 {
      font-size: 18px;
      margin-bottom: 15px;
      color: #444;
    }
    .switch {
      padding: 10px 20px;
      margin: 5px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      background: #007bff;
      color: white;
    }
    .switch.off { background: #dc3545; }
    input[type="range"] { width: 100%; accent-color: #007bff; }
    .slider-value { margin-top: 10px; font-weight: bold; }
    .progress {
      width: 100%; background: #e9ecef; border-radius: 10px; overflow: hidden; margin-top: 10px;
    }
    .progress-bar {
      height: 20px; background: #28a745; text-align: center; color: white; font-size: 12px; line-height: 20px;
    }
    canvas { max-height: 180px; width: 100%; }
  </style>
</head>
<body>
  <h1>ESP32 Cloud Dashboard</h1>

  <div class="grid-stack">
    <!-- Temperature Widget -->
    <div class="grid-stack-item" gs-x="0" gs-y="0" gs-w="3" gs-h="3">
      <div class="grid-stack-item-content">
        <h2>🌡️ Temperature</h2>
        <p id="temp">-- °C</p>
        <canvas id="tempChart"></canvas>
      </div>
    </div>

    <!-- Humidity Widget -->
    <div class="grid-stack-item" gs-x="3" gs-y="0" gs-w="3" gs-h="3">
      <div class="grid-stack-item-content">
        <h2>💧 Humidity</h2>
        <p id="humidity">-- %</p>
        <canvas id="humidityChart"></canvas>
      </div>
    </div>

    <!-- Fan Speed Slider -->
    <div class="grid-stack-item" gs-x="0" gs-y="3" gs-w="3" gs-h="2">
      <div class="grid-stack-item-content">
        <h2>🌀 Fan Speed</h2>
        <input type="range" min="0" max="100" value="0" id="fanSlider">
        <p class="slider-value" id="fanValue">0%</p>
      </div>
    </div>

    <!-- Light Switch -->
    <div class="grid-stack-item" gs-x="3" gs-y="3" gs-w="3" gs-h="2">
      <div class="grid-stack-item-content">
        <h2>💡 Light</h2>
        <button class="switch" onclick="sendCommand('light:on')">On</button>
        <button class="switch off" onclick="sendCommand('light:off')">Off</button>
      </div>
    </div>

    <!-- Water Level -->
    <div class="grid-stack-item" gs-x="6" gs-y="0" gs-w="3" gs-h="2">
      <div class="grid-stack-item-content">
        <h2>💦 Water Level</h2>
        <div class="progress">
          <div class="progress-bar" id="waterBar" style="width:0%">0%</div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Initialize Gridstack
    const grid = GridStack.init({
      float: true,
      resizable: { handles: 'all' },
      draggable: { handle: '.grid-stack-item-content' }
    });

    // Example: Fetch sensor data
    async function loadSensors() {
      const res = await fetch('/api/sensors'); // Replace with your API
      const data = await res.json();
      document.getElementById('temp').innerText = data.temperature + " °C";
      document.getElementById('humidity').innerText = data.humidity + " %";
      document.getElementById('waterBar').style.width = data.wlevel + "%";
      document.getElementById('waterBar').innerText = data.wlevel + "%";

      tempChart.data.labels.push(new Date().toLocaleTimeString());
      tempChart.data.datasets[0].data.push(data.temperature);
      tempChart.update();

      humidityChart.data.labels.push(new Date().toLocaleTimeString());
      humidityChart.data.datasets[0].data.push(data.humidity);
      humidityChart.update();
    }

    async function sendCommand(cmd) {
      await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      });
    }

    // Fan slider
    const fanSlider = document.getElementById('fanSlider');
    fanSlider.addEventListener('input', () => {
      document.getElementById('fanValue').innerText = fanSlider.value + "%";
      sendCommand("fan:" + fanSlider.value);
    });

    // Charts
    const tempChart = new Chart(document.getElementById('tempChart'), {
      type: 'line',
      data: { labels: [], datasets: [{ label: 'Temperature', data: [], borderColor: '#ff5733' }] }
    });
    const humidityChart = new Chart(document.getElementById('humidityChart'), {
      type: 'line',
      data: { labels: [], datasets: [{ label: 'Humidity', data: [], borderColor: '#007bff' }] }
    });

    setInterval(loadSensors, 3000);
  </script>
</body>
</html>
