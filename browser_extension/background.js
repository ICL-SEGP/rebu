chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "purchase_complete") {
    console.log("Processing offers with server-side validation");
    // Retrieve sensitive token from session storage
    chrome.storage.session.get({ token: null }, (sessionResult) => {
      if (!sessionResult.token) {
        console.error("Token missing in session storage. Aborting purchase.");
        return;
      }
      // Retrieve non-sensitive offers from local storage
      chrome.storage.local.get({ offers: [] }, async (localResult) => {
        try {
          const response = await fetch("https://example.com/api/endpoint", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              token: sessionResult.token,
              message: localResult.offers
            })
          });
          const data = await response.json();
          console.log("POST response:", data);
        } catch (error) {
          console.error("Error sending POST request:", error);
        }
      });
    });
  }
});

// If affiliate link is a redirect line, store affiliate and redirection details
chrome.webRequest.onBeforeRedirect.addListener(
  (details) => {
    chrome.storage.local.get(
      {
        loggedIn: false,
        trackingEnabled: false,
        redirectUrl: "Nothing",
        url: "Nothing",
        flags: {
          "affiliate_link_detected": false,
          "confirmation_page_reached": false,
          "item_confirmed": false
        }
      },
      (result) => {
        if (!result.loggedIn) return;
        if (!result.trackingEnabled) return;
        if (!result.flags["affiliate_false_detected"]) {
          console.log("Redirect detected:", details);
          let redirectUrl = details.redirectUrl;
          let url = details.url;
          if (check_for_offer(url)) {
            chrome.storage.local.set({
              redirected: true,
              redirectUrl: redirectUrl,
              url: url,
              flags: {
                "affiliate_link_detected": true,
                "confirmation_page_reached": false,
                "item_confirmed": false
              }
            });
            chrome.storage.local.set({
              trackLog: [{
                url: "Affiliate link clicked " + redirectUrl,
                type: "start",
                timestamp: new Date().toISOString()
              }]
            });
            chrome.storage.local.set({
              domain_name_1: getDomainFromHref(url),
              domain_name_2: getDomainFromHref(redirectUrl)
            });
          }
        }
      }
    );
  },
  { urls: ["<all_urls>"] }
);

// Reset local storage during tab switch
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    chrome.storage.local.get({ trackingEnabled: false }, (result) => {
      if (!result.trackingEnabled) return;
      reset_variables();
      console.log(`Local storage reset due to tab switch. New active tab: ${tab.url}`);
    });
  });
});

const manualNavigationDetected = {};

// Reset local storage if URL is manually changed
chrome.webNavigation.onCommitted.addListener((details) => {
  chrome.storage.local.get({ trackingEnabled: false, redirectUrl: "Nothing", url: "Nothing" }, (result) => {
    if (!result.trackingEnabled) return;
    if (result.url !== "Nothing" && details.url !== result.redirectUrl) {
      if (details.frameId !== 0) return;
      if (details.transitionType === "typed") {
        console.log("Manual URL change detected:", details.url);
        reset_variables();
        manualNavigationDetected[details.tabId] = details.url;
      }
    }
  });
});

chrome.webRequest.onCompleted.addListener(
  (details) => {
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
          payment_made: true
        };
        chrome.storage.local.set({ flags: updatedFlags });
      }
    });
  },
  { urls: ["*://checkout.stripe.com/*"] }
);

chrome.webRequest.onCompleted.addListener(
  (details) => {
    chrome.storage.local.get({
      flags: {
        "affiliate_link_detected": false,
        "confirmation_page_reached": false,
        "item_confirmed": false
      }
    }, (result) => {
      if (details.url.includes("paypal.com/cgi-bin/webscr") && details.statusCode === 200) {
        console.log("PayPal payment likely completed", details);
        const updatedFlags = {
          ...result.flags,
          payment_made: true
        };
        chrome.storage.local.set({ flags: updatedFlags });
      }
    });
  },
  { urls: ["*://*.paypal.com/cgi-bin/webscr*"] }
);

function reset_variables() {
  chrome.storage.local.set({
    offers: [],
    redirected: false,
    redirectUrl: "Nothing",
    url: "Nothing",
    trackLog: [],
    flags: {
      "affiliate_link_detected": false,
      "confirmation_page_reached": false,
      "item_confirmed": false
    }
  });
}

async function check_for_offer(url) {
  // For demonstration purposes, we always return true.
  console.log("Offers added");
  chrome.storage.local.set({ offers: sampleOffers });
  return true;
  try {
    chrome.storage.local.get({ token: "Nothing" }, async (result) => {
      if (result.token === "Nothing") {
        console.error("No authentication token found in Chrome storage.");
        return false;
      }
      const response = await fetch("http://18.201.163.141:4000/offers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${result.token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error("Unexpected API response format:", data);
        return false;
      }
      const currentDate = new Date();
      const found = data.filter(offer => {
        const offerStart = new Date(offer.offer_start);
        const offerEnd = new Date(offer.offer_end);
        return url.includes(offer.affiliate_link) &&
          offer.status === "active" &&
          offerStart <= currentDate &&
          offerEnd >= currentDate;
      });
      if (found) {
        console.log("Matched active offer:", found);
        chrome.storage.local.set({ offers: found });
        return true;
      }
      console.log("No matching active offer found.");
      return false;
    });
  } catch (error) {
    console.error("Error fetching or processing data:", error);
    return false;
  }
}

function getDomainFromHref(href) {
  try {
    const url = new URL(href);
    return url.hostname;
  } catch (e) {
    console.error("Invalid URL:", href);
    return null;
  }
}
