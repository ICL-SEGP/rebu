(function() {
  chrome.storage.local.get({redirected: false, trackingEnabled: false, redirectUrl: "Nothing", url: "Nothing", flags: {"affiliate_link_detected": false, "confirmation_page_reached": false, "payment_confirmed": false}}, (result) => {
    if (!result.trackingEnabled) return;
    if (!result.flags["affiliate_link_detected"] && check_for_offer(window.location.href)) {
      chrome.storage.local.set({redirectUrl: window.location.href, url: window.location.href});
      chrome.storage.local.set({trackLog: [{url: "Affiliate link clicked " + window.location.href, type:"start", timestamp: new Date().toISOString()}] });
      chrome.storage.local.set({flags: {"affiliate_link_detected": true, "confirmation_page_reached": false, "payment_confirmed": false}});
      chrome.storage.local.set({affiliate_product: document.body.innerText})
      console.log(window.location.href);
    }
    if (result.redirected) {
      chrome.storage.local.set({affiliate_product: document.body.innerText, redirected: false});
    }
  });

  // Probably useless code
  chrome.storage.local.get({ trackingEnabled: false }, (result) => {
    if (!result.trackingEnabled) return;

    document.addEventListener('click', function(event) {
      let target = event.target;
      // Traverse up the DOM tree to find an <a> element
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }
      if (target && target.href) {
        const linkUrl = target.href;
        let eventType = "link_click";
        // Mark as a purchase event if URL contains purchase-related keywords
        if (linkUrl.match(/(checkout|purchase|buy)/i)) {
          eventType = "purchase_click";
        }
        chrome.runtime.sendMessage({
          type: "track",
          data: {
            url: linkUrl,
            type: eventType
          }
        });
      }
    });
  });

  const confirmationKeywords = [
    "thank you for your purchase",
    "thank you for purchase",
    "thank you for your order",
    "your order has been placed",
    "order confirmation",
    "order complete",
    "purchase confirmed",
    "your order has been received",
    "we have received your order",
    "your order number is",
    "order successful",
    "payment successful",
    "thank you for shopping with us",
    "confirmation",
    "your purchase is complete",
    "order summary",
    "purchase complete",
    "your order is confirmed",
    "we're processing your order",
    "we are processing your order",
    "your payment has been received",
    "your order is being prepared",
    "shipping confirmed",
    "your order is on its way",
    "confirmation email sent",
    "transaction successful",
    "thank you for choosing us"
  ];

  // Function to search the DOM for confirmation keywords.
  function checkForPurchaseConfirmation() {
    // Convert the entire body text to lowercase for a case-insensitive search.
    const bodyText = document.body.innerText.toLowerCase();
    const purchasePattern = /thank[-_]?you|order[-_]?confirmation|purchase[-_]?success/i;
    if (purchasePattern.test(window.location.href)) {
      console.log("Confirmation page detected via URL check");
      chrome.storage.local.set({flags: {"affiliate_link_detected": true, "confirmation_page_reached": true, "payment_confirmed": false}})
      // reset_variables();
      return true;
    }
    for (let keyword of confirmationKeywords) {
      if (bodyText.includes(keyword)) {
        console.log("Confirmation page detected via DOM check. Keyword found:", keyword);
        chrome.local.storage.set({flags: {"affiliate_link_detected": true, "confirmation_page_reached": true, "payment_confirmed": false}})
        // reset_variables();
        return true; // Found at least one keyword, so exit.
      }
    }
    return false;
  }


  // Runs a check to find out whether page loaded is a confirmation page.
  chrome.storage.local.get({trackingEnabled: false, redirectUrl: "Nothing", url: "Nothing", flags: {"affiliate_link_detected": false, "confirmation_page_reached": false, "payment_confirmed": false}}, (result) => {
    if (!result.trackingEnabled) return;
    if (!result.flags["affiliate_link_detected"]) {
      console.log("Affiliate link not yet detected, click again")
      return;
    } else {
      console.log("Tracking pages")
    }

    checkForPurchaseConfirmation();
    
    // Set up a MutationObserver to catch dynamic changes in the page.
    const observer = new MutationObserver((mutations) => {
      // If a mutation adds new content, check again.
      checkForPurchaseConfirmation();
    });
    
    // Observe the body for changes in its subtree.
    observer.observe(document.body, { childList: true, subtree: true });
  });

})();

function check_for_offer(url) {
  return true;
}

async function check_correct_product(product1, product2) {
  const apiKey = "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"; 

  const prompt = `
    You are an AI assistant that analyzes inner text webpages to verify if any product on a purchase confirmation page matches any product on an initial affiliate link page. Follow these steps:

    1. **Extract Product Details from the Affiliate Link Page:**
      - Analyze the inner text and identify all product's product name, brand, model, and any unique identifiers (e.g., SKU, ASIN).
      - Ignore irrelevant content like ads, navigation, or unrelated text.

    2. **Extract Product Details from the Confirmation Page:**
      - Analyze the inner text and identify all products listed on the confirmation page.
      - For each product, extract the product name, brand, model, and unique identifiers.

    3. **Compare the Products:**
      - Compare each product from the affiliate link page with each product on the confirmation page.
      - If **any product** on the confirmation page matches any product on the affiliate link exactly (based on name, brand, model, and unique identifiers), respond with 'YES'.
      - If no products match, respond with 'NO'.

    4. **Output Format:**
      - Do not provide any additional explanation, details, or steps.
      - Only respond with 'YES' or 'NO'.

    **Input:**
    - Affiliate Link Page inner text: ${product1}
    - Confirmation Page inner text: ${product2}
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

function reset_variables() {
  chrome.storage.local.set({redirected: false, redirectUrl: "Nothing", url: "Nothing", trackLog: [], flags: {"affiliate_link_detected": false, "confirmation_page_reached": false, "payment_confirmed": false}});
}
  