// Probably useless code
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "track") {
    chrome.storage.local.get({ trackLog: [] }, (result) => {
      const log = result.trackLog;
      log.push({
        url: message.data.url,
        type: message.data.type,
        timestamp: new Date().toISOString()
      });
      chrome.storage.local.set({ trackLog: log });
    });
  }
});

// If affiliate link is a redireect line, stores affiliate link and the link to which a redirection is done
chrome.webRequest.onBeforeRedirect.addListener(
  (details) => {
    chrome.storage.local.get({trackingEnabled: false, redirectUrl: "Nothing", url: "Nothing"}, (result) => {
      if (!result.trackingEnabled) return;
      if (result.url == "Nothing") {
        console.log("Redirect detected:", details);
        // You can process or store details.url (original) and details.redirectUrl (new URL)
        let redirectUrl = details["redirectUrl"]
        let url = details["url"]
        let offer = {redirectUrl: url}
        if (check_for_offer(url)) {
          chrome.storage.local.set({redirectUrl: redirectUrl, url: url})
          chrome.storage.local.set({ trackLog: [{url: "Affiliate link clicked " + redirectUrl, type:"start", timestamp: new Date().toISOString()}] })
        }
      }
    })
  },
  { urls: ["<all_urls>"] } // Adjust URL patterns as needed
);

// Reset local storage during tab switch
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    chrome.storage.local.get({trackingEnabled: false}, (result) => {
      if (!result.trackingEnabled) return;
      chrome.storage.local.set({redirectUrl: "Nothing", url: "Nothing", trackLog: []});
      console.log(`Local storage reset due to tab switch. New active tab: ${tab.url}`);
    });
  });
});

const manualNavigationDetected = {};

// Reset local storage if url is manually changed
chrome.webNavigation.onCommitted.addListener((details) => {
  chrome.storage.local.get({trackingEnabled: false, redirectUrl: "Nothing", url: "Nothing"}, (result) => {
    if (!result.trackingEnabled) return;
    if (result.url !== "Nothing") {
      // Only check main frame navigations.
      if (details.frameId !== 0) return;
      
      // "typed" indicates a manual URL entry in many cases.
      if (details.transitionType === "typed") {
        console.log("Manual URL change detected:", details.url);
        // Mark this tab's navigation as manual.
        reset_variables();
        manualNavigationDetected[details.tabId] = details.url;
        chrome.runtime.sendMessage({
          type: "manual_url_change",
          data: { url: details.url }
        });
      }
    }
  });
});



function reset_variables() {
  chrome.storage.local.set({redirectUrl: "Nothing", url: "Nothing", trackLog: [], flags: {"affiliate_link_detected": false, "confirmation_page_reached": false, "payment_confirmed": false}});
}
  

function check_for_offer(url) {
  // Should fetch all affiliate links associates with offers
  return true;
}
