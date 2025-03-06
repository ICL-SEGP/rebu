document.addEventListener('DOMContentLoaded', function () {
  // ========== Cache UI elements ==========
  const permissionStatus = document.getElementById('permissionStatus');
  const enableTracking = document.getElementById('enableTracking');
  const disableTracking = document.getElementById('disableTracking');
  const logDiv = document.getElementById('log');
  const clearLog = document.getElementById('clearLog');
  const affiliateLinkStatus = document.getElementById("affiliate_link_pressed");
  const confirmationStatus = document.getElementById("confirmation_page");
  const purchaseStatus = document.getElementById("item_detected");
  const conversionBadge = document.getElementById("conversionBadge");
  const offersDiv = document.getElementById('content-offers');

  // Login elements
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginButton = document.getElementById("login");
  const messageDisplay = document.getElementById("message");
  const logoutButton = document.getElementById("logout");

  // Tab elements
  const tabLoginBtn = document.getElementById('tab-login');
  const tabStatusBtn = document.getElementById('tab-status');
  const tabLogsBtn = document.getElementById('tab-logs');

  const contentLogin = document.getElementById('content-login');
  const contentStatus = document.getElementById('content-status');
  const contentLogs = document.getElementById('content-logs');

  // ========== Utility Functions ==========
  // Switches the visible tab by ID
  function switchTab(tabName) {
    // Remove active classes
    [tabLoginBtn, tabStatusBtn, tabLogsBtn].forEach(btn => btn.classList.remove('active'));
    [contentLogin, contentStatus, contentLogs].forEach(div => div.classList.remove('active'));

    // Add active classes to the chosen tab
    document.getElementById('tab-' + tabName).classList.add('active');
    document.getElementById('content-' + tabName).classList.add('active');
  }

  // Update permission status text + refresh logs
  function updatePermissionStatus(enabled) {
    permissionStatus.textContent = enabled ? "Tracking Enabled" : "Tracking Disabled";
    fetchLog();
    fetchOffers();
  }

  // Fetch & display logs
  function fetchLog() {
    chrome.storage.local.get({ trackLog: [] }, function (result) {
      displayLog(result.trackLog);
    });
  }
  function fetchOffers() {
    chrome.storage.local.get({offers: []}, function (result) {
      displayOffers(result.offers);
    })
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
  function displayOffers(offers) {
    offersDiv.innerHTML = "";
    if (offers.length === 0) {
      offersDiv.textContent = "No offers available";
    } else {
      // Create an unordered list to hold the offers
      const ul = document.createElement("ul");
      offers.forEach(offer => {
        const li = document.createElement("li");
        // Create a button for the offer
        const btn = document.createElement("button");
        btn.textContent = `${offer.desc} - $${offer.itemCost} (${offer.status})`;
        // Add a custom class to style the button
        btn.classList.add("offer-button");
        // When the button is clicked, open the affiliate link in a new tab
        btn.addEventListener("click", () => {
          window.open(offer.affiliate_link, "_blank");
        });
        li.appendChild(btn);
        ul.appendChild(li);
      });
      offersDiv.appendChild(ul);
    }
  }
  

  // ========== INITIAL LOAD ==========
  // 1) Check if user is already logged in
  chrome.storage.sync.get({ loggedIn: false, username: "" }, function (syncResult) {
    if (syncResult.loggedIn) {
      // Switch to status tab immediately
      messageDisplay.innerText = `Welcome back, ${syncResult.username}!`;
      switchTab("status");
    } else {
      // Show login tab
      switchTab("login");
    }
  });

  // 2) Display tracking status
  chrome.storage.local.get({ trackingEnabled: false }, function (result) {
    updatePermissionStatus(result.trackingEnabled);
  });

  // 3) Display tracking flags
  chrome.storage.local.get({
    flags: {
      affiliate_link_detected: false,
      confirmation_page_reached: false,
      item_confirmed: false
    }
  }, function (result) {
    const flags = result.flags;
    affiliateLinkStatus.style.backgroundColor = flags.affiliate_link_detected ? "green" : "gray";
    confirmationStatus.style.backgroundColor = flags.confirmation_page_reached ? "green" : "gray";
    purchaseStatus.style.backgroundColor = flags.item_confirmed ? "green" : "gray";
    conversionBadge.style.display = flags.item_confirmed ? "block" : "none";
  });

  // ========== EVENT LISTENERS ==========
  // Enable tracking
  enableTracking.addEventListener('click', function () {
    chrome.storage.local.set({ trackingEnabled: true }, function () {
      updatePermissionStatus(true);
    });
  });

  // Disable tracking
  disableTracking.addEventListener('click', function () {
    chrome.storage.local.set({redirected: false, redirectUrl: "Nothing", url: "Nothing", trackLog: [], flags: {"affiliate_link_detected": false, "confirmation_page_reached": false, "item_confirmed": false}}
    , function () {
      updatePermissionStatus(false);
    });
  });

  // Clear log
  clearLog.addEventListener('click', function () {
    chrome.storage.local.set({ trackLog: [] }, function () {
      displayLog([]);
    });
  });

  // Login
  loginButton.addEventListener("click", async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!username || !password) {
      messageDisplay.innerText = "Please enter credentials";
      return;
    }

    // Simulate an API call (replace with your real login logic)
    try {
      // const response = await fetch(`http://18.201.163.141:4000/api/login`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     email: username,
      //     password: password,
      //   }),
      // });
      // console.log(response);
      console.log("HELLOOOOOOOOO");
      await new Promise(resolve => setTimeout(resolve, 500)); // Fake network delay
      const data = { success: true }; // Simulated response

      if (data.success) {
        chrome.storage.sync.set({ loggedIn: true, token:"Nothing" /*Insert token*/ }, function () {
          messageDisplay.innerText = "Login successful!";
          // Switch to "Status" tab
          switchTab("status");
        });
      } else {
        messageDisplay.innerText = "Invalid credentials";
      }
    } catch (error) {
      messageDisplay.innerText = "Login failed IDK";
      console.error("Login error:", error);
    }
  });

  // Logout
  logoutButton.addEventListener("click", async () => {
    // Clear loggedIn state
    chrome.storage.local.set({offers: [], redirected: false, redirectUrl: "Nothing", url: "Nothing", trackLog: [], flags: {"affiliate_link_detected": false, "confirmation_page_reached": false, "item_confirmed": false}})
    chrome.storage.sync.set({ loggedIn: false, username: "" }, function () {
      messageDisplay.innerText = "You have been logged out.";
      // Switch back to login tab 
      switchTab("login");
    });
  });

  // Listen for storage changes (update flags/logs in real time)
  chrome.storage.onChanged.addListener((changes, areaName) => {
    console.log(changes)
    if (areaName === "local") {
      if (changes.flags) {
        const newFlags = changes.flags.newValue;
        affiliateLinkStatus.style.backgroundColor = newFlags.affiliate_link_detected ? "green" : "gray";
        confirmationStatus.style.backgroundColor = newFlags.confirmation_page_reached ? "green" : "gray";
        purchaseStatus.style.backgroundColor = newFlags.item_confirmed ? "green" : "gray";
        conversionBadge.style.display = newFlags.item_confirmed ? "block" : "none";
      }
      if (changes.trackingEnabled) {
        updatePermissionStatus(changes.trackingEnabled.newValue);
      }
      if (changes.trackLog) {
        displayLog(changes.trackLog.newValue || []);
      }
      if (changes.offers) {
        displayOffers(changes.offers.newValue || []);
      }
    }
  });

  const tabButtons = document.querySelectorAll('.tabs button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove 'active' from all buttons & contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // Add 'active' to this button & its matching content
      button.classList.add('active');
      const contentId = 'content-' + button.id.split('-')[1];
      document.getElementById(contentId).classList.add('active');
    });
  });
});
