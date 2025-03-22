let activeTabId = null;
let siteTimers = {};
let startTime = null;
let lastTrackedSite = null;
let saveTimeout = null;

// Load saved timers from storage
chrome.storage.local.get("siteTimers", (data) => {
  if (data.siteTimers) {
    siteTimers = data.siteTimers;
    console.log("Loaded site timers:", siteTimers);
  }
});

// Track time when a tab is activated
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (chrome.runtime.lastError) {
      console.error("Error getting tab:", chrome.runtime.lastError);
      return;
    }
    trackTime(tab);
  });
});

// Track time when a tab is updated (e.g., URL changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && changeInfo.url) {
    trackTime(tab);
  }
});

// Stop tracking when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeTabId === tabId) {
    stopTracking();
  }
});

// Track time for a specific site
function trackTime(tab) {
  if (tab && tab.url) {
    let site = getSiteName(tab.url);
    if (site) {
      console.log(`Tracking site: ${site} on tab ID: ${tab.id}`);
      if (activeTabId) {
        stopTracking();
      }
      activeTabId = tab.id;
      startTime = Date.now();
      lastTrackedSite = site;
      if (!siteTimers[site]) {
        siteTimers[site] = 0;
      }
    }
  } else {
    console.error("Invalid tab or URL:", tab);
  }
}

// Stop tracking and save elapsed time
function stopTracking() {
  if (activeTabId && startTime && lastTrackedSite) {
    let elapsedTime = (Date.now() - startTime) / 1000;
    let site = lastTrackedSite;

    if (site) {
      console.log(`Stopped tracking site: ${site}, time spent: ${elapsedTime} seconds`);
      siteTimers[site] = (siteTimers[site] || 0) + elapsedTime;
      debouncedSaveTimers();
    }

    activeTabId = null;
    startTime = null;
    lastTrackedSite = null;
  }
}

// Get the site name from the URL
function getSiteName(url) {
  try {
    if (typeof url !== "string") {
      console.error("Invalid URL for tracking:", url);
      return null;
    }

    // Skip chrome:// and about: URLs
    if (url.startsWith("chrome://") || url.startsWith("about:")) {
      console.error("Skipping internal Chrome URL:", url);
      return null;
    }

    // Check for specific sites
    const sites = {
      "codeforces.com": "Codeforces",
      "leetcode.com": "LeetCode",
      "github.com": "GitHub",
    };

    for (let domain in sites) {
      if (url.includes(domain)) {
        return sites[domain];
      }
    }

    return null; // Only track specific sites
  } catch (error) {
    console.error("Error parsing URL:", error);
    return null;
  }
}

// Throttle storage updates
function saveTimers() {
  chrome.storage.local.set({ siteTimers }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error saving site timers:", chrome.runtime.lastError);
    } else {
      console.log("Site timers saved:", siteTimers);
    }
  });
}

function debouncedSaveTimers() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(saveTimers, 10000); // Save every 10 seconds
}

// Keep the service worker alive
chrome.alarms.create("keepAlive", { periodInMinutes: 1 });