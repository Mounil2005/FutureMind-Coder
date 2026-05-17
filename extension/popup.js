const PLATFORM_COLORS = {
  leetcode:   "#C4912A",
  codeforces: "#4A8FD4",
  github:     "#6E6A60",
  codechef:   "#B5532E",
  atcoder:    "#5A7FA8",
};

const PLATFORM_LABELS = {
  leetcode:   "LeetCode",
  codeforces: "Codeforces",
  github:     "GitHub",
  codechef:   "CodeChef",
  atcoder:    "AtCoder",
};

function fmtTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

function fmtPomodoro(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

async function getLocal(keys) {
  return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
}

// ── Settings panel ─────────────────────────────────────────────────────────

let settingsOpen = false;

async function loadSettings() {
  const { apiUrl = "", authToken = "" } = await getLocal(["apiUrl", "authToken"]);
  document.getElementById("input-api-url").value   = apiUrl;
  document.getElementById("input-auth-token").value = authToken ? "••••••••" : "";
  document.getElementById("settings-dash-link").href = (apiUrl || "http://localhost:3000") + "/settings";
}

function toggleSettings() {
  settingsOpen = !settingsOpen;
  document.getElementById("settings-panel").classList.toggle("hidden", !settingsOpen);
  document.getElementById("btn-settings").classList.toggle("active", settingsOpen);
  if (settingsOpen) {
    loadSettings();
    document.getElementById("save-status").textContent = "";
  }
}

document.getElementById("btn-settings").addEventListener("click", toggleSettings);

document.getElementById("btn-save").addEventListener("click", async () => {
  const apiUrl    = document.getElementById("input-api-url").value.trim().replace(/\/$/, "");
  const rawToken  = document.getElementById("input-auth-token").value.trim();

  if (!apiUrl) {
    document.getElementById("save-status").textContent = "Dashboard URL is required.";
    document.getElementById("save-status").style.color = "var(--primary)";
    return;
  }

  const updates = { apiUrl };
  // Only update token if user typed something other than our placeholder bullets
  if (rawToken && !rawToken.startsWith("•")) updates.authToken = rawToken;

  await new Promise((resolve) => chrome.storage.local.set(updates, resolve));

  document.getElementById("save-status").textContent = "Saved!";
  document.getElementById("save-status").style.color = "var(--success)";
  setTimeout(() => {
    document.getElementById("save-status").textContent = "";
    toggleSettings();
    render();
  }, 800);
});

// ── Main render ────────────────────────────────────────────────────────────

async function render() {
  const { apiUrl, totals = {}, pomodoroActive, pomodoroSecondsLeft } =
    await getLocal(["apiUrl", "totals", "pomodoroActive", "pomodoroSecondsLeft"]);

  const state = await new Promise((resolve) =>
    chrome.runtime.sendMessage({ type: "GET_STATE" }, (r) => resolve(r ?? {})),
  );

  const appUrl = apiUrl || "http://localhost:3000";
  document.getElementById("dash-link").href       = appUrl + "/dashboard";
  document.getElementById("open-dashboard").href  = appUrl + "/login";

  const hasSetup = !!apiUrl;

  document.getElementById("setup-notice").classList.toggle("hidden", hasSetup || settingsOpen);
  document.getElementById("main").classList.toggle("hidden", !hasSetup);

  if (!hasSetup) return;

  // Status dot
  const dot = document.getElementById("status-dot");
  dot.classList.toggle("active", !!state.activePlatform);

  // Current platform
  const nameEl = document.getElementById("platform-name");
  if (state.activePlatform) {
    nameEl.textContent = PLATFORM_LABELS[state.activePlatform] ?? state.activePlatform;
    nameEl.className = "platform-name";
  } else {
    nameEl.textContent = "Not on a tracked site";
    nameEl.className = "platform-name idle";
  }

  // Totals list
  const list = document.getElementById("totals-list");
  const entries = Object.entries(totals).filter(([, v]) => v > 0);
  if (entries.length === 0) {
    list.innerHTML = `<div style="color:var(--muted);font-size:12px">Nothing tracked today yet.</div>`;
  } else {
    list.innerHTML = entries
      .sort(([, a], [, b]) => b - a)
      .map(
        ([platform, secs]) => `
        <div class="platform-row">
          <div class="platform-dot" style="background:${PLATFORM_COLORS[platform] ?? "#888"}"></div>
          <div class="platform-label">${PLATFORM_LABELS[platform] ?? platform}</div>
          <div class="platform-time">${fmtTime(secs)}</div>
        </div>`,
      )
      .join("");
  }

  // Pomodoro
  const isRunning = state.pomodoroActive ?? pomodoroActive ?? false;
  const secsLeft  = state.pomodoroSecondsLeft ?? pomodoroSecondsLeft ?? 25 * 60;

  const timerEl = document.getElementById("pomodoro-timer");
  timerEl.textContent = fmtPomodoro(Math.max(0, secsLeft));
  timerEl.className = "pomodoro-timer" + (isRunning ? " running" : "");

  document.getElementById("btn-start").classList.toggle("hidden", isRunning);
  document.getElementById("btn-stop").classList.toggle("hidden", !isRunning);
}

// Buttons
document.getElementById("btn-start").addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ type: "START_POMODORO", minutes: 25 });
  render();
});

document.getElementById("btn-stop").addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ type: "STOP_POMODORO" });
  render();
});

document.getElementById("btn-reset").addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ type: "RESET_TOTALS" });
  render();
});

// Refresh every second while popup is open
render();
const iv = setInterval(render, 1_000);
window.addEventListener("unload", () => clearInterval(iv));
