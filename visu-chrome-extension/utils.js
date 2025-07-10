const detectProductPageFromURL = (url) => {
  return /\/(dp|gp\/product)\//.test(url);
};
