chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.includes("amazon") &&
    tab.url.split("/")[3].length > 1
  ) {
    console.log("Amazon product page detected, opening popup.");

    chrome.action.setPopup({ popup: "popup.html" }); // Set popup before opening
    chrome.action.openPopup(); // Open the popup
  }
});
