// If affiliate link is a redirect line, stores affiliate link and the link to which a redirection is done
chrome.webRequest.onBeforeRedirect.addListener(
  (details) => {
    chrome.storage.local.get({trackingEnabled: false, redirectUrl: "Nothing", url: "Nothing", flags: {"affiliate_link_detected": false, "confirmation_page_reached": false, "item_confirmed": false}}, (result) => {
      if (!result.trackingEnabled) return;
      if (!result.flags["affiliate_false_detected"]) {
        console.log("Redirect detected:", details);
        // You can process or store details.url (original) and details.redirectUrl (new URL)
        let redirectUrl = details["redirectUrl"]
        let url = details["url"]
        let offer = {redirectUrl: url}
        if (check_for_offer(url)) {
          chrome.storage.local.set({redirected: true, redirectUrl: redirectUrl, url: url, flags: {"affiliate_link_detected": true, "confirmation_page_reached": false, "item_confirmed": false}})
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
      reset_variables();
      console.log(`Local storage reset due to tab switch. New active tab: ${tab.url}`);
    });
  });
});

const manualNavigationDetected = {};

// Reset local storage if url is manually changed
chrome.webNavigation.onCommitted.addListener((details) => {
  chrome.storage.local.get({trackingEnabled: false, redirectUrl: "Nothing", url: "Nothing"}, (result) => {
    if (!result.trackingEnabled) return;
    if (result.url !== "Nothing" && details.url !== result.redirectUrl) {
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

chrome.webRequest.onCompleted.addListener((details) => {
  chrome.storage.local.get({
    flags: {
      "affiliate_link_detected": false,
      "confirmation_page_reached": false,
      "item_confirmed": false
    }
  }, (result) => {
    console.log(details.url);
    if (details.url.includes("checkout.stripe.com/c/pay") && details.statusCode === 200) {
      console.log("Stripe payment likely completed", details);
      const updatedFlags = {
        ...result.flags,
        payment_made: true  // add/update the payment_made flag
      };
      chrome.storage.local.set({ flags: updatedFlags });
    }
  });
}, { urls: ["*://checkout.stripe.com/*"] });


chrome.webRequest.onCompleted.addListener((details) => {
  chrome.storage.local.get({
    flags: {
      "affiliate_link_detected": false,
      "confirmation_page_reached": false,
      "item_confirmed": false
    }
  }, (result) => {
    // Check if the request URL indicates a PayPal payment and status is successful
    if (details.url.includes("paypal.com/cgi-bin/webscr") && details.statusCode === 200) {
      console.log("PayPal payment likely completed", details);
      const updatedFlags = {
        ...result.flags,
        payment_made: true
      };
      chrome.storage.local.set({ flags: updatedFlags });
      // Further processing logic can go here.
    }
  });
}, { urls: ["*://*.paypal.com/cgi-bin/webscr*"] });


function reset_variables() {
  chrome.storage.local.set({redirected: false, redirectUrl: "Nothing", url: "Nothing", trackLog: [], flags: {"affiliate_link_detected": false, "confirmation_page_reached": false, "item_confirmed": false}});
}
  

function check_for_offer(url) {
  // Should fetch all affiliate links associates with offers
  return true;
}
