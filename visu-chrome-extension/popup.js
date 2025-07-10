document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { type: "GET_PAGE_TYPE" }, (response) => {
      if (chrome.runtime.lastError || !response) {
        document.getElementById("not-product").style.display = "block";
        return;
      }

      if (response.isProductPage) {
        document.getElementById("scrape-btn").style.display = "inline-block";
      } else {
        document.getElementById("not-product").style.display = "block";
      }

      
    });
  });
});
