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
  