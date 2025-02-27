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

// If link contains order confirmation words, register as a complete purchase
chrome.webRequest.onCompleted.addListener(
  (details) => {
    // Only consider main frame navigations.
    if (details.frameId !== 0) return;

    // Delay processing to let the manual navigation event be recorded.
    setTimeout(() => {
      // If a manual change was recorded for this tab with the same URL, skip processing.
      if (manualNavigationDetected[details.tabId] === details.url) {
        console.log("Skipping webRequest processing because manual change was detected.");
        // Optionally clear the flag.
        delete manualNavigationDetected[details.tabId];
        return;
      }

      const purchasePattern = /thank[-_]?you|order[-_]?confirmation|purchase[-_]?success/i;
      if (purchasePattern.test(details.url)) {
        console.log("Purchase detected via network (webRequest):", details.url);
        reset_variables();
        chrome.runtime.sendMessage({
          type: "purchase_detected",
          data: { url: details.url, method: "webRequest" }
        });
      }
    }, 200); // 200ms delay (adjust as needed)
  },
  { urls: ["<all_urls>"] }
);


function reset_variables() {
  chrome.storage.local.set({redirectUrl: "Nothing", url: "Nothing", trackLog: []});
}
  

function check_for_offer(url) {
  // Should fetch all affiliate links associates with offers
  return true;
}

async function sendDynamicPrompt(xyz, abc) {
  const apiKey = "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"; 

  const prompt = `
    You are an AI assistant that analyzes HTML webpages to verify if any product on a purchase confirmation page matches the product on an initial affiliate link page. Follow these steps:

    1. **Extract Product Details from the Affiliate Link Page:**
      - Analyze the HTML and identify the product name, brand, model, and any unique identifiers (e.g., SKU, ASIN).
      - Ignore irrelevant content like ads, navigation, or unrelated text.

    2. **Extract Product Details from the Confirmation Page:**
      - Analyze the HTML and identify all products listed on the confirmation page.
      - For each product, extract the product name, brand, model, and unique identifiers.

    3. **Compare the Products:**
      - Compare the product from the affiliate link page with each product on the confirmation page.
      - If **any product** on the confirmation page matches the affiliate link product exactly (based on name, brand, model, and unique identifiers), respond with 'YES'.
      - If no products match, respond with 'NO'.

    4. **Output Format:**
      - Do not provide any additional explanation, details, or steps.
      - Only respond with 'YES' or 'NO'.

    **Input:**
    - Affiliate Link Page HTML: ${affiliateLinkHTML}
    - Confirmation Page HTML: ${confirmationPageHTML}
    `;
  try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json"
          },
          body: JSON.stringify({
              model: "deepseek/deepseek-r1:free",
              messages: [{ role: "user", content: prompt }]
          })
      });

      const data = await response.json();
      console.log(data);
      console.log("DeepSeek Response:", data.choices[0].message.content);
      return data.choices[0].message.content;
  } catch (error) {
      console.error("Error sending request:", error);
      return null;
  }
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "send_prompt") {
        sendDynamicPrompt(message.xyz).then(response => {
            sendResponse({ response });
        });
        return true; 
    }
});
