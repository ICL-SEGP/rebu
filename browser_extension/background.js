chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "purchase_complete") {
    console.log("Processing offers");
    // Send a response back
    chrome.storage.local.get({relevantOffers: [], token: "Nothing"}, async (result) => {
      if (result.token !== "Nothing") {
        try {

          const response = await fetch("http://18.201.163.141:4000/orders/detect", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${result.token}`
            },
            body: JSON.stringify({offer_ids: result.relevantOffers.map((offer) => offer.id) })
          });
          const data = await response.json();
          console.log("POST response:", data);
        } catch (error) {
          console.error("Error sending POST request:", error);
        }
      }
    })
  }
});

// If affiliate link is a redirect line, stores affiliate link and the link to which a redirection is done
chrome.webRequest.onBeforeRedirect.addListener(
  (details) => {
    chrome.storage.local.get({loggedIn:false, trackingEnabled: false, redirectUrl: "Nothing", url: "Nothing", flags: {"affiliate_link_detected": false, "confirmation_page_reached": false, "item_confirmed": false}}, async (result) => {
      if (!result.loggedIn) return;
      if (!result.trackingEnabled) return;
      if (!result.flags["affiliate_false_detected"]) {
        console.log("Redirect detected:", details);
        // You can process or store details.url (original) and details.redirectUrl (new URL)
        let redirectUrl = details["redirectUrl"]
        let url = details["url"]
        let v = await check_for_offer(url);
        if (v) {
          chrome.storage.local.set({redirected: true, redirectUrl: redirectUrl, url: url, flags: {"affiliate_link_detected": true, "confirmation_page_reached": false, "item_confirmed": false}})
          chrome.storage.local.set({ trackLog: [{url: "Affiliate link clicked " + redirectUrl, type:"start", timestamp: new Date().toISOString()}] });
          chrome.storage.local.set({domain_name_1: getDomainFromHref(url), domain_name_2: getDomainFromHref(redirectUrl)});
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
  console.log("HELLLLLLLLLLOOOOOOOO");
  chrome.storage.local.get({flags: {"affiliate_link_detected": false, "confirmation_page_reached": false, "item_confirmed": false}, trackingEnabled: false, redirectUrl: "Nothing", url: "Nothing"}, (result) => {
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
      }
    }
    if (result.flags["affiliate_link_detected"] && result.flags["confirmation_page_reached"] && result.flags["item_confirmed"]) {
      console.log("Offer confirmed, everything reset");
      reset_variables();
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
  chrome.storage.local.set({offers: [], redirected: false, redirectUrl: "Nothing", url: "Nothing", trackLog: [], flags: {"affiliate_link_detected": false, "confirmation_page_reached": false, "item_confirmed": false}});
}
  


function storageGetAsync(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(result);
    });
  });
}

async function check_for_offer(url) {
  console.log("Offers added");
  try {
    // Use our helper function to await chrome.storage.local.get
    const result = await storageGetAsync({ token: "Nothing" });
    if (result.token === "Nothing") {
      console.error("No authentication token found in Chrome storage.");
      return false;
    }

    // Fetch offers from API
    const response = await fetch("http://18.201.163.141:4000/offers", { 
      method: "GET",
      headers: {
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${result.token}`,
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
    console.log(data);

    const currentDate = new Date();

    const found = data.filter(offer => {
      const offerStart = new Date(offer.offer_start);
      const offerEnd = new Date(offer.offer_end);
      return offer.status === "active" &&
             offerStart <= currentDate &&
             offerEnd >= currentDate;
    });

    const relevantFound = data.filter(offer => {
      const offerStart = new Date(offer.offer_start);
      const offerEnd = new Date(offer.offer_end);
      return url.includes(offer.affiliate_link) &&
             offer.status === "active" &&
             offerStart <= currentDate &&
             offerEnd >= currentDate;
    });

    chrome.storage.local.set({ offers: found, relevantOffers: relevantFound });
    
    // Optionally, push a sample offer (if needed)
    relevantFound.push(sampleOffers[0]);
    
    if (relevantFound.length > 0) {
      console.log("Matched active offer:", relevantFound);
      return true;
    }

    console.log("No matching active offer found.");
    return false;
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
