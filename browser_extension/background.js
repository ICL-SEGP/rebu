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
  

  async function sendDynamicPrompt(xyz) {
    const apiKey = "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"; 

    const prompt = `Using the content of ${xyz}, ensure that they are the same product`;

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
