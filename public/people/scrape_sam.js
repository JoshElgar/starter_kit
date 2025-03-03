// Find all <img> elements with class "sticker" and alt "sticker"
const images = document.querySelectorAll('img.sticker[alt="sticker"]');
const imageArray = Array.from(images);

if (imageArray.length === 0) {
  console.log('No images with class="sticker" and alt="sticker" found.');
} else {
  console.log(`Found ${imageArray.length} images. Starting downloads...`);

  // Function to download a single image with a delay
  const downloadImage = (img, index, total) => {
    return new Promise((resolve) => {
      const src = img.src; // Base64 data URL
      const filename = `sticker-${index + 1}.png`;

      // Convert base64 to blob
      fetch(src)
        .then((response) => response.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = filename;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Clean up the object URL
          URL.revokeObjectURL(url);

          console.log(`Downloaded ${filename} (${index + 1}/${total})`);
          resolve();
        })
        .catch((err) => {
          console.error(`Failed to download image ${index + 1}:`, err);
          resolve(); // Continue despite error
        });
    });
  };

  // Process downloads sequentially with a delay
  const downloadAll = async () => {
    for (let i = 0; i < imageArray.length; i++) {
      await downloadImage(imageArray[i], i, imageArray.length);
      await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay
    }
    console.log("All downloads completed!");
  };

  // Start the download process
  downloadAll();
}
