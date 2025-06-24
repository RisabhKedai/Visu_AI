window.onload = () => {
  console.log("Amazon product page detected.");

  const titleElement =
    document.querySelector("#productTitle") ||
    document.querySelector(".a-size-large");

  // Extract high-resolution images from alt images section
  const productImages = Array.from(
    document.querySelectorAll("#altImages img")
  )
    .map((img) => {
      const imgUrl = img.getAttribute("src");
      // Skip sprite images and play icons
      if (imgUrl && !imgUrl.includes("sprite") && !imgUrl.includes("play-icon")) {
        // Convert to full-size image URL by removing size modifiers
        return imgUrl.replace(/\._[^.]*\./g, ".");
      }
      return null;
    })
    .filter((src) => src && src.startsWith("https")); // Remove null values & ensure valid URLs

  // Extract search keyword
  // Extract search keyword from the populated input field
  const searchInputElement = document.querySelector("#twotabsearchtextbox");
  let keyword =
    searchInputElement === ""
      ? "User hasn't put anything in search box"
      : searchInputElement.value.trim();

  // Extract Amazon-corrected keyword (if available)
  // let correctedKeywordElement = document.querySelector(
  //   ".a-color-state.a-text-bold"
  // );
  // if (!correctedKeywordElement === null || !correctedKeywordElement === "") {
  //   keyword = correctedKeywordElement.innerText.trim();
  // }

  const productData = {
    title: titleElement ? titleElement.innerText.trim() : "Title not found",
    images: productImages,
    keyword: keyword,
  };

  // Send data to API
  fetch("http://localhost:3000/store-product", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  })
    .then((response) => response.json())
    .then((data) => console.log("Product data sent:", data))
    .catch((error) => console.error("Error sending data:", error));
};
