// Utilities for preparing transparent logo assets
import logoImage from '../assets/branding/campusconnect-logo.png';

// Cache results so the conversion runs once
let cachedLogoDataUrl = null;
let pendingPromise = null;

// Convert the logo to a transparent data URL
export const getTransparentLogoDataUrl = () => {
  if (cachedLogoDataUrl) return Promise.resolve(cachedLogoDataUrl);
  if (pendingPromise) return pendingPromise;

  pendingPromise = new Promise((resolve, reject) => {
    // Load the logo image into a canvas
    const img = new Image();
    img.src = logoImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        pendingPromise = null;
        reject(new Error('Canvas context unavailable'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Remove near-white pixels to create transparency
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r > 235 && g > 235 && b > 235) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      cachedLogoDataUrl = canvas.toDataURL('image/png');
      resolve(cachedLogoDataUrl);
    };
    img.onerror = () => {
      pendingPromise = null;
      reject(new Error('Failed to load logo image'));
    };
  });

  return pendingPromise;
};
