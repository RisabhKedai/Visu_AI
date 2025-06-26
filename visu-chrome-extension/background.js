chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const tabUrl = tab.url;
  const isProductPage = /\/(dp|gp\/product)\//.test(tabUrl);
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.includes("amazon") &&
    isProductPage
  ) {
    console.log("Amazon product page detected, opening popup.");
    chrome.action.setPopup({ popup: "popup.html" });
    chrome.action.openPopup();
  }
});
