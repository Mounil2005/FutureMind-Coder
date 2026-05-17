/**
 * CodeTracker Timer — background service worker
 *
 * Tracks focused time on coding platforms and syncs to the
 * CodeTracker API every SYNC_INTERVAL seconds.
 */

const PLATFORMS = {
  leetcode:   { pattern: /leetcode\.com/,    label: "LeetCode"   },
  codeforces: { pattern: /codeforces\.com/,  label: "Codeforces" },
  github:     { pattern: /github\.com/,      label: "GitHub"     },
  codechef:   { pattern: /codechef\.com/,    label: "CodeChef"   },
  atcoder:    { pattern: /atcoder\.jp/,      label: "AtCoder"    },
};

const TICK_MS       = 1_000;   // 1 s internal tick
const SYNC_INTERVAL = 60;      // flush to server every 60 s of accumulated time
const POMODORO_MIN  = 25;      // default pomodoro length in minutes

// ── State ──────────────────────────────────────────────────────────────────

let activeTabId   = null;
let activePlatform = null;
let tickTimer     = null;

// In-memory buffer: platform → seconds since last flush
const buffer = {};

// Pomodoro
let pomodoroActive    = false;
let pomodoroSecondsLeft = POMODORO_MIN * 60;
let pomodoroTabId     = null;

// ── Helpers ────────────────────────────────────────────────────────────────

function detectPlatform(url) {
  if (!url) return null;
  for (const [key, { pattern }] of Object.entries(PLATFORMS)) {
    if (pattern.test(url)) return key;
  }
  return null;
}

async function getStorage(keys) {
  return new Promise((resolve) =>
    chrome.storage.local.get(keys, resolve),
  );
}

async function setStorage(items) {
  return new Promise((resolve) =>
    chrome.storage.local.set(items, resolve),
  );
}

// ── Tick ───────────────────────────────────────────────────────────────────

function startTick() {
  if (tickTimer) return;
  tickTimer = setInterval(onTick, TICK_MS);
}

function stopTick() {
  if (!tickTimer) return;
  clearInterval(tickTimer);
  tickTimer = null;
}

async function onTick() {
  if (!activePlatform) return;

  // Accumulate in buffer
  buffer[activePlatform] = (buffer[activePlatform] ?? 0) + 1;

  // Persist running totals to storage for popup reads
  const { totals = {} } = await getStorage("totals");
  totals[activePlatform] = (totals[activePlatform] ?? 0) + 1;
  await setStorage({ totals, lastPlatform: activePlatform });

  // Flush when buffer hits SYNC_INTERVAL
  if (buffer[activePlatform] % SYNC_INTERVAL === 0) {
    await flushPlatform(activePlatform, SYNC_INTERVAL);
  }

  // Pomodoro countdown
  if (pomodoroActive && pomodoroTabId === activeTabId) {
    pomodoroSecondsLeft -= 1;
    if (pomodoroSecondsLeft <= 0) {
      pomodoroActive = false;
      pomodoroSecondsLeft = 0;
      chrome.notifications.create("pomodoro_done", {
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Time's up!",
        message: "Your 25-minute session is done. Take a break.",
      });
      await setStorage({ pomodoroActive: false, pomodoroSecondsLeft: 0 });
    } else {
      await setStorage({ pomodoroActive, pomodoroSecondsLeft });
    }
  }
}

async function flushPlatform(platform, seconds) {
  const { apiUrl, authToken } = await getStorage(["apiUrl", "authToken"]);
  if (!apiUrl || !authToken) return;

  try {
    await fetch(`${apiUrl}/api/extension/timer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ platform, seconds, action: "ping" }),
    });
  } catch {
    // Network error — data stays in buffer, next flush will catch up
  }
}

// ── Tab tracking ───────────────────────────────────────────────────────────

function handleTabChange(tabId, url) {
  const detected = detectPlatform(url);

  if (tabId !== activeTabId || detected !== activePlatform) {
    activePlatform = detected;
    activeTabId    = tabId;
  }

  if (activePlatform) {
    startTick();
  } else {
    stopTick();
  }
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  handleTabChange(tabId, tab?.url ?? "");
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) handleTabChange(tabId, changeInfo.url);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === activeTabId) {
    activeTabId    = null;
    activePlatform = null;
    stopTick();
  }
});

// Keep alive: check current active tab on install / restart
chrome.runtime.onInstalled.addListener(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) handleTabChange(tab.id, tab.url ?? "");
});

// ── Message API (from popup) ───────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "GET_STATE") {
    sendResponse({
      activePlatform,
      pomodoroActive,
      pomodoroSecondsLeft,
    });
    return true;
  }

  if (msg.type === "START_POMODORO") {
    pomodoroActive     = true;
    pomodoroSecondsLeft = (msg.minutes ?? POMODORO_MIN) * 60;
    pomodoroTabId      = activeTabId;
    setStorage({ pomodoroActive, pomodoroSecondsLeft });
    sendResponse({ ok: true });
    return true;
  }

  if (msg.type === "STOP_POMODORO") {
    pomodoroActive     = false;
    pomodoroSecondsLeft = 0;
    setStorage({ pomodoroActive: false, pomodoroSecondsLeft: 0 });
    sendResponse({ ok: true });
    return true;
  }

  if (msg.type === "RESET_TOTALS") {
    for (const k of Object.keys(buffer)) buffer[k] = 0;
    setStorage({ totals: {} });
    sendResponse({ ok: true });
    return true;
  }
});
