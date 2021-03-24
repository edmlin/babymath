function computeBoundingRect(imageData) {
  const rect = new Rect(imageData);

  for (let i = 0; i < imageData.width * imageData.height; i += 1) {
    const j = i * 4;

    if (imageData.data[j + 0] <255  || imageData.data[j + 1] <255 || imageData.data[j + 2] <255) {
      const x = i % imageData.width;
      const y = Math.floor(i / imageData.width);

      rect.xmin = Math.min(x, rect.xmin);
      rect.xmax = Math.max(x, rect.xmax);
      rect.ymin = Math.min(y, rect.ymin);
      rect.ymax = Math.max(y, rect.ymax);
    }
  }

  return rect;
}

function convertToGrayscale(imageData) {
  const dataGrayscale = [];
  const { data } = imageData;

  for (let i = 0; i < imageData.width * imageData.height; i += 1) {
    const j = i * 4;
    const avg = (data[j + 0] + data[j + 1] + data[j + 2]) / 3;
    const normalized = 1- avg / 255.0;
    dataGrayscale.push(normalized);
  }

  return dataGrayscale;
}