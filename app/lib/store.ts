import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function filePath(name: string) {
  return path.join(DATA_DIR, `${name}.json`);
}

function readJson<T>(name: string, fallback: T): T {
  ensureDir();
  const fp = filePath(name);
  if (!fs.existsSync(fp)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(fp, "utf-8"));
  } catch {
    return fallback;
  }
}

function writeJson<T>(name: string, data: T) {
  ensureDir();
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2));
}

// ─── Types ───
export type VarType = "boolean" | "integer" | "float" | "string";
export type VarDirection = "device_to_cloud" | "cloud_to_device" | "bidirectional";

export interface ThingVariable {
  name: string;
  type: VarType;
  direction: VarDirection;
  min?: number;
  max?: number;
}

export interface Thing {
  id: string;
  name: string;
  device: string;
  deviceId: string;
  sketch: string;
  variables: ThingVariable[];
  lastModified: string;
  created: string;
}

export interface Device {
  id: string;
  name: string;
  type: string;
  status: "online" | "offline";
  lastSeen: string;
  ip: string;
  thing: string;
  autoRegistered: boolean;
}

export interface Dashboard {
  id: string;
  name: string;
  type: string;
  device: string;
  thingId: string;
  thingName: string;
  lastOpened: string;
  created: string;
  coverColor: string;
  icon: string;
  widgetCount: number;
}

export interface Widget {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  variable?: string;
  variableLabel?: string;
}

export interface Trigger {
  id: string;
  name: string;
  type: "Greater Than" | "Less Than" | "Equal To";
  variable: string;
  threshold: string;
  thing: string;
  active: boolean;
  lastFired: string;
}

export interface Sketch {
  id: string;
  name: string;
  thing: string;
  updated: string;
  size: string;
  content: string;
}

export interface SensorData {
  temperature: number;
  humidity: number;
  light: boolean;
  fan: number;
  water: number;
  timestamp: string;
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
}

// ─── Things ───
const DEFAULTS: Thing[] = [
  {
    id: "thing-1", name: "Green House Variables", device: "Green House", deviceId: "dev-2", sketch: "Green_House_Variables",
    variables: [
      { name: "temperature", type: "float" as VarType, direction: "device_to_cloud" as VarDirection, min: -10, max: 50 },
      { name: "humidity", type: "float" as VarType, direction: "device_to_cloud" as VarDirection, min: 0, max: 100 },
      { name: "water", type: "integer" as VarType, direction: "device_to_cloud" as VarDirection, min: 0, max: 100 },
    ],
    lastModified: "Aug 14, 2025, 8:25 AM", created: "Aug 11, 2025, 6:23 PM",
  },
  {
    id: "thing-2", name: "ESP32 Controller", device: "ESP32 Dev Board", deviceId: "dev-1", sketch: "esp32_cloud",
    variables: [
      { name: "temperature", type: "float" as VarType, direction: "device_to_cloud" as VarDirection, min: -10, max: 50 },
      { name: "humidity", type: "float" as VarType, direction: "device_to_cloud" as VarDirection, min: 0, max: 100 },
      { name: "light", type: "boolean" as VarType, direction: "bidirectional" as VarDirection },
      { name: "fan", type: "integer" as VarType, direction: "bidirectional" as VarDirection, min: 0, max: 100 },
      { name: "water", type: "integer" as VarType, direction: "device_to_cloud" as VarDirection, min: 0, max: 100 },
    ],
    lastModified: "May 10, 2026, 9:50 PM", created: "May 10, 2026",
  },
];

const THINGS_FILE = "things";
export function getThings(): Thing[] {
  const raw = readJson<any[]>(THINGS_FILE, DEFAULTS);
  // Migration: convert old string[] variables to ThingVariable[]
  return raw.map((t) => ({
    ...t,
    deviceId: t.deviceId || "",
    variables: (t.variables || []).map((v: any) =>
      typeof v === "string" ? { name: v, type: "float" as VarType, direction: "device_to_cloud" as VarDirection } : v
    ),
  }));
}
export function saveThings(data: Thing[]) {
  writeJson(THINGS_FILE, data);
}

// ─── Devices ───
const DEVICES_FILE = "devices";
export function getDevices(): Device[] {
  return readJson<Device[]>(DEVICES_FILE, [
    { id: "dev-1", name: "ESP32 Dev Board", type: "ESP32", status: "online", lastSeen: "Just now", ip: "192.168.1.42", thing: "—", autoRegistered: true },
    { id: "dev-2", name: "Green House Sensor", type: "ESP32", status: "online", lastSeen: "2 min ago", ip: "192.168.1.43", thing: "—", autoRegistered: true },
  ]);
}
export function saveDevices(data: Device[]) {
  writeJson(DEVICES_FILE, data);
}

// Auto-register or update device from sensor POST
export function registerDeviceFromSensor(sensorData: SensorData) {
  if (!sensorData.deviceId) return;
  const devices = getDevices();
  const existing = devices.find((d) => d.id === sensorData.deviceId);
  const now = new Date().toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  if (existing) {
    existing.status = "online";
    existing.lastSeen = "Just now";
    existing.name = sensorData.deviceName || existing.name;
    existing.type = sensorData.deviceType || existing.type;
  } else {
    devices.push({
      id: sensorData.deviceId,
      name: sensorData.deviceName || "ESP32 Device",
      type: sensorData.deviceType || "ESP32",
      status: "online",
      lastSeen: "Just now",
      ip: "—",
      thing: "—",
      autoRegistered: true,
    });
  }
  saveDevices(devices);
}

// ─── Dashboards ───
const DASHBOARDS_FILE = "dashboards";
export function getDashboards(): Dashboard[] {
  return readJson<Dashboard[]>(DASHBOARDS_FILE, [
    { id: "esp32-main", name: "ESP32", type: "Custom", device: "ESP32 Dev Board", thingId: "thing-2", thingName: "ESP32 Controller", lastOpened: "May 10, 2026, 9:50 PM", created: "May 10, 2026", coverColor: "#00979d", icon: "Cpu", widgetCount: 5 },
    { id: "greenhouse", name: "Green House", type: "Custom", device: "Green House", thingId: "thing-1", thingName: "Green House Variables", lastOpened: "May 10, 2026, 11:49 PM", created: "May 10, 2026", coverColor: "#2ecc71", icon: "Thermometer", widgetCount: 3 },
    { id: "greenhouse-vars", name: "Green House Variables", type: "Template", device: "Green House", thingId: "thing-1", thingName: "Green House Variables", lastOpened: "May 7, 2026, 5:29 PM", created: "Aug 11, 2025", coverColor: "#9b59b6", icon: "LayoutDashboard", widgetCount: 4 },
  ]);
}
export function saveDashboards(data: Dashboard[]) {
  writeJson(DASHBOARDS_FILE, data);
}

// ─── Widgets per Dashboard ───
export function getWidgets(dashboardId: string): Widget[] {
  return readJson<Widget[]>(`widgets_${dashboardId}`, []);
}
export function saveWidgets(dashboardId: string, data: Widget[]) {
  writeJson(`widgets_${dashboardId}`, data);
}

// ─── Triggers ───
const TRIGGERS_FILE = "triggers";
export function getTriggers(): Trigger[] {
  return readJson<Trigger[]>(TRIGGERS_FILE, [
    { id: "t1", name: "High Temperature Alert", type: "Greater Than", variable: "temperature", threshold: "30", thing: "ESP32", active: true, lastFired: "Never" },
    { id: "t2", name: "Fan Speed Control", type: "Less Than", variable: "temperature", threshold: "20", thing: "ESP32", active: true, lastFired: "Never" },
    { id: "t3", name: "Water Level Low", type: "Less Than", variable: "water", threshold: "20", thing: "Green House", active: false, lastFired: "Never" },
  ]);
}
export function saveTriggers(data: Trigger[]) {
  writeJson(TRIGGERS_FILE, data);
}

// ─── Sketches ───
const SKETCHES_FILE = "sketches";
export function getSketches(): Sketch[] {
  return readJson<Sketch[]>(SKETCHES_FILE, [
    { id: "sk1", name: "esp32_cloud.ino", thing: "ESP32", updated: "May 10, 2026", size: "2.4 KB", content: "// ESP32 Cloud Sketch\nvoid setup() { Serial.begin(115200); }\nvoid loop() { delay(1000); }" },
    { id: "sk2", name: "greenhouse_sensors.ino", thing: "Green House", updated: "May 9, 2026", size: "3.1 KB", content: "// Green House Sensors\nvoid setup() { pinMode(A0, INPUT); }\nvoid loop() { int val = analogRead(A0); delay(500); }" },
    { id: "sk3", name: "variables_aug11a.ino", thing: "Green House Variables", updated: "Aug 11, 2025", size: "1.8 KB", content: "// Variables Sketch\nfloat temp = 0; float hum = 0;\nvoid setup() { Serial.begin(9600); }\nvoid loop() { delay(1000); }" },
  ]);
}
export function saveSketches(data: Sketch[]) {
  writeJson(SKETCHES_FILE, data);
}

// ─── Sensor Data (latest + history) ───
const SENSOR_FILE = "sensors";
const SENSOR_HISTORY_FILE = "sensor_history";

export function getLatestSensor(): SensorData {
  const d = readJson<SensorData>(SENSOR_FILE, {
    temperature: 24.5, humidity: 60, light: false, fan: 0, water: 45, timestamp: new Date().toISOString(),
  });
  return d;
}

export function saveSensorData(data: Partial<SensorData>) {
  const current = getLatestSensor();
  const updated: SensorData = { ...current, ...data, timestamp: new Date().toISOString() };
  writeJson(SENSOR_FILE, updated);

  // Append to history
  const history = getSensorHistory();
  history.push(updated);
  if (history.length > 200) history.splice(0, history.length - 200);
  writeJson(SENSOR_HISTORY_FILE, history);

  // Auto-register device if deviceId is present
  if (data.deviceId) {
    registerDeviceFromSensor(updated);
  }

  // Evaluate triggers against new data
  evaluateTriggers(updated);

  // Notify SSE clients
  notifySSEClients(updated);

  return updated;
}

export function getSensorHistory(): SensorData[] {
  return readJson<SensorData[]>(SENSOR_HISTORY_FILE, []);
}

// ─── Trigger Evaluation ───
function evaluateTriggers(data: SensorData) {
  const triggers = getTriggers();
  let changed = false;
  const key = new Date().toLocaleString();

  const updated = triggers.map((t) => {
    if (!t.active) return t;
    const val = (data as any)[t.variable];
    if (val === undefined) return t;
    const thresh = parseFloat(t.threshold);
    let fire = false;
    if (t.type === "Greater Than") fire = val > thresh;
    else if (t.type === "Less Than") fire = val < thresh;
    else if (t.type === "Equal To") fire = val === thresh;

    if (fire && t.lastFired !== key) {
      changed = true;
      return { ...t, lastFired: key };
    }
    return t;
  });

  if (changed) saveTriggers(updated);
}

// ─── SSE ───
type SSEClient = { id: number; controller: ReadableStreamDefaultController };
let sseClients: SSEClient[] = [];
let sseIdCounter = 0;

export function addSSEClient(controller: ReadableStreamDefaultController): number {
  const id = ++sseIdCounter;
  sseClients.push({ id, controller });
  return id;
}

export function removeSSEClient(id: number) {
  sseClients = sseClients.filter((c) => c.id !== id);
}

function notifySSEClients(data: SensorData) {
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  sseClients = sseClients.filter((c) => {
    try {
      c.controller.enqueue(new TextEncoder().encode(msg));
      return true;
    } catch {
      return false;
    }
  });
}

export { notifySSEClients };
