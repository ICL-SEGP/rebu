(function() {
  chrome.storage.local.get({loggedIn: false, affiliate_product: "Nothing", redirected: false, trackingEnabled: false, redirectUrl: "Nothing", url: "Nothing", flags: {"affiliate_link_detected": false, "confirmation_page_reached": false, "item_confirmed": false}}, (result) => {
    if (!result.loggedIn)
    if (!result.trackingEnabled) return;
    if (!result.flags["affiliate_link_detected"] && check_for_offer(window.location.href)) {
      chrome.storage.local.set({url: window.location.href});
      chrome.storage.local.set({trackLog: [{url: "Affiliate link clicked " + window.location.href, type:"start", timestamp: new Date().toISOString()}] });
      chrome.storage.local.set({flags: {"affiliate_link_detected": true, "confirmation_page_reached": false, "item_confirmed": false}});
      chrome.storage.local.set({affiliate_product: document.body.innerText})
      console.log(window.location.href);
    }
    if (result.redirected) {
      chrome.storage.local.set({affiliate_product: document.body.innerText, redirected: false});
    }


    checkForPurchaseConfirmation(result.affiliate_product);
    
    // Set up a MutationObserver to catch dynamic changes in the page.
    const observer = new MutationObserver((mutations) => {
      // If a mutation adds new content, check again.
      checkForPurchaseConfirmation(result.affiliate_product);
    });
    
    // Observe the body for changes in its subtree.
    observer.observe(document.body, { childList: true, subtree: true });
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
  function checkForPurchaseConfirmation(affiliate_product) {
    // Convert the entire body text to lowercase for a case-insensitive search.
    const bodyText = document.body.innerText.toLowerCase();
    const purchasePattern = /thank[-_]?you|order[-_]?confirmation|purchase[-_]?success/i;
    if (purchasePattern.test(window.location.href)) {
      console.log("Confirmation page detected via URL check");
      chrome.storage.local.set({flags: {"affiliate_link_detected": true, "confirmation_page_reached": true, "item_confirmed": false}})
      // reset_variables();
      check_correct_product(affiliate_product, document.body.innerText)
      return true;
    }
    for (let keyword of confirmationKeywords) {
      if (bodyText.includes(keyword)) {
        console.log("Confirmation page detected via DOM check. Keyword found:", keyword);
        chrome.local.storage.set({flags: {"affiliate_link_detected": true, "confirmation_page_reached": true, "item_confirmed": false}})
        // reset_variables();
        check_correct_product(affiliate_product, document.body.innerText)
        return true; // Found at least one keyword, so exit.
      }
    }
    return false;
  }
})();

const sampleOffers = [
  {
    id: 1,
    affiliate: 101,
    desc: "Offer #1",
    itemCost: 29.99,
    status: "active",
    start: new Date("2025-01-01"),
    end: new Date("2025-12-31"),
    affiliate_link: "https://example.com/product1",
    orderIds: []
  },
  {
    id: 2,
    affiliate: 102,
    desc: "Offer #2",
    itemCost: 39.99,
    status: "active",
    start: new Date("2025-01-01"),
    end: new Date("2025-12-31"),
    affiliate_link: "https://example.com/product2",
    orderIds: []
  },
  {
    id: 3,
    affiliate: 103,
    desc: "Offer #3",
    itemCost: 19.99,
    status: "active",
    start: new Date("2025-01-01"),
    end: new Date("2025-12-31"),
    affiliate_link: "https://example.com/product3",
    orderIds: []
  },
  // ... add as many sample offers as you like ...
];

async function check_for_offer(url) {
  console.log("Offers added");
  chrome.storage.local.set({offers:sampleOffers});
  return true;
  try {
      chrome.storage.local.get({token: "Nothing"}, async (result) => {
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

        // Check response status
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        // Ensure the data structure is valid
        if (!Array.isArray(data)) {
            console.error("Unexpected API response format:", data);
            return false;
        }

        // Get the current date
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
            chrome.storage.local.set({offers: found})
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




async function check_correct_product_deepseek(product1, product2) {
  const apiKey = "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"; 
  console.log("Check called");
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
      console.log("Waiting for response");
      const data = await response.json();
      console.log(data);
      const reply = data.choices[0].message.content;
      console.log("DeepSeek Response:", reply);
      if (reply === "YES") {
        chrome.storage.local.set({flags: {"affiliate_link_detected": true, "confirmation_page_reached": true, "item_confirmed": true}});
        chrome.runtime.sendMessage({
          type: "purchase_complete",
        });
      } else {
        console.log("Cannot confirm purchase");
      }
      return reply;
  } catch (error) {
      console.error("Error sending request:", error);
      return null;
  }
}

async function check_correct_product(product1, product2) {
  const apiKey = "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"; // Replace with your actual API key
  console.log("Check called");
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
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.0,
        max_tokens: 10
      })
    });
    console.log("Waiting for response");
    const data = await response.json();
    console.log(data);
    const reply = data.choices[0].message.content.trim();
    console.log("OpenAI Response:", reply);
    if (reply === "YES") {
      chrome.storage.local.set({
        flags: {
          "affiliate_link_detected": true,
          "confirmation_page_reached": true,
          "item_confirmed": true
        }
      
      });
      chrome.runtime.sendMessage({
        type: "purchase_complete",
      });
    } else {
      console.log("Cannot confirm purchase");
    }
    return reply;
  } catch (error) {
    console.error("Error sending request:", error);
    return null;
  }
}

function reset_variables() {
  chrome.storage.local.set({offers:[], redirected: false, redirectUrl: "Nothing", url: "Nothing", trackLog: [], flags: {"affiliate_link_detected": false, "confirmation_page_reached": false, "item_confirmed": false}});
}
  