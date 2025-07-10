window.onload = () => {
  const isProductPage = detectProductPageFromURL(window.location.href);
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_PAGE_TYPE") {
      sendResponse({ isProductPage });
    }
  });
};
