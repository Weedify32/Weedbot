const sensorGrid = document.getElementById("sensor-grid");
const deviceGrid = document.getElementById("device-grid");
const updatedAt = document.getElementById("updated-at");
const aiLog = document.getElementById("ai-log");
const chatOutput = document.getElementById("chat-output");
const runtimeBadge = document.getElementById("runtime-badge");
const visitorBadge = document.getElementById("visitor-badge");
const growLogEl = document.getElementById("grow-log");
const planList = document.getElementById("plan-list");
const recentActions = document.getElementById("recent-actions");
const tentsGrid = document.getElementById("tents-grid");

const sensors = [
  { label: "Air Temp", value: "73.7°F", note: "Veg Week 1 target 72-75°F" },
  { label: "Humidity", value: "39.6%", note: "Dry side; watch VPD" },
  { label: "VPD", value: "1.71 kPa", note: "Trim to ~1.2-1.4 for veg" },
  { label: "CO₂", value: "—", note: "Optional; 900-1200 ppm ideal" },
  { label: "Leaf Δ", value: "—", note: "Check IR leaf temp for Δ" },
  { label: "Solution Temp", value: "—", note: "Keep 65-68°F in RDWC" },
];

const devices = [
  { name: "Grow Light", status: "on" },
  { name: "Exhaust Fan", status: "off" },
  { name: "Circulation Fan", status: "on" },
  { name: "Pump", status: "on" },
  { name: "Humidifier", status: "off" },
  { name: "Heat Mat", status: "off" },
];

const tents = [
  {
    name: "Tent #1",
    badge: "1.png",
    gear: [
      "AC Infinity CLOUDLAB 844 4x4",
      "AC Infinity Controller 69 Pro",
      "AC Infinity IONFRAME EVO6 500W LED Grow Light",
      "AC Infinity CLOUDFORGE T3 Humidifier",
      "AC Infinity CLOUDLINE PRO 6\" Inline Fan",
      "AC Infinity 6\" Refillable Carbon Filter",
      "AC Infinity CLOUDRAY S6 Gen 2 Clip Fans x2",
      "AC Infinity CLOUDRAY S6 Gen 1 Clip Fan",
      "Custom 15 Gallon Waterfall RDWC System",
      "DC5000 1320 GPH 40W DC Pump",
      "Bluelab pH Controller Connect",
      "Bluelab Guardian Monitor Connect",
    ],
  },
  {
    name: "Tent #2",
    badge: "2.png",
    gear: [
      "AC Infinity CLOUDLAB 844 4x4",
      "AC Infinity Controller 69 Pro",
      "AC Infinity IONBOARD S44 430W LED Grow Light",
      "AC Infinity CLOUDFORGE T3 Humidifier",
      "AC Infinity CLOUDLINE PRO 6\" Inline Fan",
      "AC Infinity 6\" Carbon Filter",
      "AC Infinity CLOUDRAY S6 Gen 2 Clip Fans x2",
      "AC Infinity CLOUDRAY S6 Gen 1 Clip Fan",
      "AC Infinity Self-Watering Fabric Pot Bases",
      "AC Infinity Humidity Dome with Height Extension",
      "AC Infinity SUNCORE S3 Seedling Heat Mat",
      "RAINPOINT Automatic Watering System",
    ],
  },
  {
    name: "Tent #3",
    badge: "3.png",
    gear: [
      "AC Infinity CLOUDLAB 844 4x4",
      "AC Infinity Controller 69 Pro",
      "AC Infinity IONFRAME EVO6 500W LED Grow Light",
      "AC Infinity CLOUDFORGE T3 Humidifier",
      "AC Infinity CLOUDLINE PRO 6\" Inline Fan",
      "AC Infinity 6\" Refillable Carbon Filter",
      "AC Infinity CLOUDRAY S6 Gen 2 Clip Fans x2",
      "AC Infinity CLOUDRAY S6 Gen 1 Clip Fan",
      "Custom 15 Gallon Waterfall RDWC System",
      "DC5000 1320 GPH 40W DC Pump",
      "Bluelab pH Controller Connect",
      "Bluelab Guardian Monitor Connect",
    ],
  },
];

const VISITOR_KEY = "smh_visits";
const VISITOR_BASELINE = 4200;
const runtimeStart = new Date("2024-09-01T08:00:00Z");

const growLog = [
  { date: "Day 118", text: "Reservoir swap: 1.2 EC, pH 5.8, +2 ml/gal cal-mag. Pump purge 45s, DO check good." },
  { date: "Day 113", text: "Defoliated 3 fan leaves; opened canopy. VPD held 1.0-1.2 kPa after exhaust pulse." },
  { date: "Day 107", text: "Top-off 1.5 L RO, drifted pH 6.0→5.8 with 1 ml pH down. Roots white, no slime." },
  { date: "Day 94", text: "Lollipop under node 4. Mild tip burn noted; backed EC from 1.4→1.2." },
  { date: "Day 82", text: "Swapped air stones; increased airflow 10%. CO₂ capped at 1200 ppm for week 5." },
  { date: "Day 63", text: "Pruned suckers, tied leader. Ran 5-minute pump recirc test—no leaks." },
  { date: "Day 42", text: "Full drain/fill. Sterilized bucket with 3% peroxide rinse. New mix 1.0 EC, pH 5.8." },
  { date: "Day 15", text: "Seedling hardening done; first mild feed 0.6 EC. Root zone 20°C stable." },
];

const weeklyPlan = [
  "Mon · Top-off to level line, target pH 5.7–5.9",
  "Wed · Check roots & air stones, wipe lid, clean sight glass",
  "Fri · Light prune and leaf tuck to open airflow",
  "Sun · 30% water change, reset EC, log drift",
];

const actionChips = [
  "Fed 1.2 EC / pH 5.8",
  "Defoliated 3 leaves",
  "CO₂ capped 1200 ppm",
  "Pump recirc test ✔",
  "Exhaust pulsed 10 min",
];

function renderSensors() {
  sensorGrid.innerHTML = sensors
    .map(
      (s) => `
      <div class="sensor-card">
        <div class="sensor-label">${s.label}</div>
        <div class="sensor-value">${s.value}</div>
        <div class="sensor-note">${s.note}</div>
      </div>
    `
    )
    .join("");
}

function renderDevices() {
  deviceGrid.innerHTML = devices
    .map(
      (d) => `
      <div class="device-pill">
        <div class="device-left">
          <span class="dot ${d.status === "on" ? "green" : "pink"}"></span>
          <div>${d.name}</div>
        </div>
        <div class="status-pill ${
          d.status === "on" ? "status-on" : "status-off"
        }">
          ${d.status === "on" ? "On" : "Off"}
        </div>
      </div>
    `
    )
    .join("");
}

function setUpdatedTime() {
  const now = new Date();
  updatedAt.textContent = `Updated ${now.toLocaleTimeString()}`;
}

function renderRuntime() {
  if (!runtimeBadge) return;
  const now = Date.now();
  const days = Math.max(1, Math.floor((now - runtimeStart.getTime()) / 86400000) + 1);
  runtimeBadge.textContent = `Day ${days} · Autonomous grow`;
}

function renderVisitors() {
  if (!visitorBadge) return;
  const stored = parseInt(localStorage.getItem(VISITOR_KEY) || "0", 10);
  const updated = stored + 1;
  localStorage.setItem(VISITOR_KEY, String(updated));
  const estimate = VISITOR_BASELINE + updated;
  visitorBadge.textContent = `Visitors (est): ${estimate.toLocaleString()} · you’re #${updated}`;
}

function renderTents() {
  if (!tentsGrid) return;
  tentsGrid.innerHTML = tents
    .map(
      (t) => `
      <div class="tent-card">
        <div class="tent-header">
          <img class="tent-badge" src="${t.badge}" alt="${t.name} badge" />
          <div>${t.name}</div>
        </div>
        <ul class="tent-gear">
          ${t.gear.map((g) => `<li>${g}</li>`).join("")}
        </ul>
      </div>
    `
    )
    .join("");
}

function renderGrowLog() {
  if (!growLogEl) return;
  growLogEl.innerHTML = growLog
    .map(
      (entry) => `
      <div class="log-entry">
        <div class="log-date">${entry.date}</div>
        <div class="log-text">${entry.text}</div>
      </div>
    `
    )
    .join("");
}

function renderPlan() {
  if (!planList) return;
  planList.innerHTML = weeklyPlan.map((item) => `<li>${item}</li>`).join("");
}

function renderActions() {
  if (!recentActions) return;
  recentActions.innerHTML = actionChips
    .map((chip) => `<span class="chip">${chip}</span>`)
    .join("");
}

function pushLog(message) {
  const time = new Date().toLocaleTimeString();
  aiLog.textContent = `[${time}] ${message}\n` + aiLog.textContent;
}

function setStatus(text) {
  if (chatOutput) {
    chatOutput.textContent = text;
  }
}

async function fetchStatusTick() {
  try {
    const response = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message:
          "Give a concise status update for the weed farm live grow. Include VPD, pH/EC guidance, safety/legal reminder, and the next action. Keep it short.",
        sensors: sensors.reduce((acc, s) => {
          acc[s.label] = s.value;
          return acc;
        }, {}),
      }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    setStatus(data.reply);
    pushLog(`AI: ${data.reply}`);
  } catch (error) {
    const fallback =
      "AI status: target VPD ~1.2–1.4 kPa for veg, pH 5.7–5.9, EC 1.1–1.3, res 65–68°F, high DO; operate legally and safely.";
    setStatus(fallback);
    pushLog(`AI (fallback): ${fallback}`);
  }
}

// No chat or handle inputs; AI posts status automatically.

renderSensors();
renderDevices();
setUpdatedTime();
renderRuntime();
renderVisitors();
renderTents();
renderGrowLog();
renderPlan();
renderActions();
pushLog("AI status feed ready (chat disabled).");
fetchStatusTick();
setInterval(fetchStatusTick, 30000);

