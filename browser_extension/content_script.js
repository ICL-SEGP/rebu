(function() {
    // Check if tracking is enabled
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
  })();
  