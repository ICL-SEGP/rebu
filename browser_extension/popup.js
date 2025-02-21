document.addEventListener('DOMContentLoaded', function() {
    const permissionStatus = document.getElementById('permissionStatus');
    const enableTracking = document.getElementById('enableTracking');
    const disableTracking = document.getElementById('disableTracking');
    const logDiv = document.getElementById('log');
    const clearLog = document.getElementById('clearLog');
  
    // Check and display the current tracking permission status
    chrome.storage.local.get({ trackingEnabled: false }, function(result) {
      updatePermissionStatus(result.trackingEnabled);
    });
  
    enableTracking.addEventListener('click', function() {
      chrome.storage.local.set({ trackingEnabled: true }, function() {
        updatePermissionStatus(true);
      });
    });
  
    disableTracking.addEventListener('click', function() {
      chrome.storage.local.set({ trackingEnabled: false }, function() {
        updatePermissionStatus(false);
      });
    });
  
    clearLog.addEventListener('click', function() {
      chrome.storage.local.set({ trackLog: [] }, function() {
        displayLog([]);
      });
    });
  
    function updatePermissionStatus(enabled) {
      permissionStatus.textContent = enabled ? "Tracking Enabled" : "Tracking Disabled";
      fetchLog();
    }
  
    function fetchLog() {
      chrome.storage.local.get({ trackLog: [] }, function(result) {
        displayLog(result.trackLog);
      });
    }
  
    function displayLog(log) {
      logDiv.innerHTML = "";
      if (log.length === 0) {
        logDiv.textContent = "No events tracked.";
      } else {
        log.forEach(event => {
          let p = document.createElement('p');
          p.textContent = `[${event.timestamp}] ${event.type}: ${event.url}`;
          logDiv.appendChild(p);
        });
      }
    }
  });
  
  document.getElementById("login").addEventListener("click", async () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    console.log(username)
    if (!username || !password) {
        document.getElementById("message").innerText = "Please enter credentials";
        return;
    }

    // Mock API call (replace with actual authentication API)
    const response = await fetch("https://example.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.success) {
        chrome.storage.sync.set({ loggedIn: true, username }, () => {
            document.getElementById("message").innerText = "Login successful!";
        });
    } else {
        document.getElementById("message").innerText = "Invalid credentials";
    }
});
