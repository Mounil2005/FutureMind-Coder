let cachedSiteTimers = {}; 

document.addEventListener("DOMContentLoaded", () => {
  console.log("Popup loaded"); // Debug log
  refreshPopup();
  setInterval(refreshPopup, 5000); 
});


chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.siteTimers) {
    console.log("Storage changed, updating cache..."); 
    cachedSiteTimers = changes.siteTimers.newValue || {}; 
    refreshPopup(); 
  }
});


function refreshPopup() {
  console.log("Refreshing popup with cached data:", cachedSiteTimers); 
  const stats = document.getElementById("stats");

  if (!stats) {
    console.error("Stats element not found"); 
    return;
  }

  stats.innerHTML = ""; 

  
  for (let site in cachedSiteTimers) {
    const li = document.createElement("li");

    
    const totalSeconds = cachedSiteTimers[site];
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    
    li.textContent = `${site}: ${minutes} minutes ${seconds} seconds`;
    stats.appendChild(li);
  }
}


chrome.storage.local.get("siteTimers", (data) => {
  if (chrome.runtime.lastError) {
    console.error("Error fetching site timers:", chrome.runtime.lastError);
    return;
  }

  console.log("Initial data loaded from storage:", data.siteTimers);
  cachedSiteTimers = data.siteTimers || {}; 
  refreshPopup();
});


const backendUrl = "https://codetrackrapi.onrender.com/update-timers";

function sendDataToBackend(data) {
  
  const formattedData = {};
  for (let site in data) {
    const totalSeconds = data[site];
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    formattedData[site] = `${minutes} minutes ${seconds} seconds`;
  }

  console.log("Sending data to backend:", formattedData); 

  
  fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formattedData),
  })
    .then((response) => response.text())
    .then((result) => {
      console.log("Data sent to backend:", result);
    })
    .catch((error) => {
      console.error("Error sending data to backend:", error);
      alert("Error: Could not send data to the server. Please try again.");
    });
}


setInterval(() => {
  if (Object.keys(cachedSiteTimers).length > 0) {
    console.log("Sending data to backend:", cachedSiteTimers); // Debug log
    sendDataToBackend(cachedSiteTimers);
  }
}, 1000); 