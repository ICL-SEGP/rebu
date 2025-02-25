(function() {
  chrome.storage.local.get({trackingEnabled: false, redirectUrl: "Nothing", url: "Nothing"}, (result) => {
    if (!result.trackingEnabled) return;
    if (result.url === "Nothing" && check_for_offer(window.location.href)) {
      chrome.storage.local.set({redirectUrl: window.location.href, url: window.location.href})
      chrome.storage.local.set({ trackLog: [{url: "Affiliate link clicked " + window.location.href, type:"start", timestamp: new Date().toISOString()}] })
      console.log(window.location.href);
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
    "purchase complete"
  ];

  // Function to search the DOM for confirmation keywords.
  function checkForPurchaseConfirmation() {
    // Convert the entire body text to lowercase for a case-insensitive search.
    const bodyText = document.body.innerText.toLowerCase();
    
    for (let keyword of confirmationKeywords) {
      if (bodyText.includes(keyword)) {
        console.log("Purchase detected via DOM check. Keyword found:", keyword);
        chrome.runtime.sendMessage({
          type: "purchase_detected_dom",
          data: { url: window.location.href, keyword: keyword }
        });
        return true; // Found at least one keyword, so exit.
      }
    }
    return false;
  }

  // Runs a check to find out whether page loaded is a confirmation page.
  chrome.storage.local.get({trackingEnabled: false, redirectUrl: "Nothing", url: "Nothing"}, (result) => {
    if (!result.trackingEnabled) return;
    if (result.url === "Nothing") {
      console.log("Affiliate link not recognised, click again")
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
