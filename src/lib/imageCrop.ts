import { Area } from 'react-easy-crop';

/**
 * Create a cropped image from the source image using the crop area
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Use larger canvas size for better quality
  const outputSize = 512;
  canvas.width = outputSize;
  canvas.height = outputSize;

  // Calculate rotation
  const centerX = image.width / 2;
  const centerY = image.height / 2;

  // Save context state
  ctx.save();
  
  // Move to center of canvas
  ctx.translate(outputSize / 2, outputSize / 2);
  
  // Rotate around center
  ctx.rotate((rotation * Math.PI) / 180);

  // Calculate the scale to fill the canvas with the cropped area
  const scale = outputSize / pixelCrop.width;
  
  // Draw image centered - offset by crop position
  ctx.drawImage(
    image,
    -pixelCrop.x * scale - (pixelCrop.width * scale) / 2,
    -pixelCrop.y * scale - (pixelCrop.height * scale) / 2,
    image.width * scale,
    image.height * scale
  );

  // Restore context
  ctx.restore();

  // Return blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas is empty'));
      }
    }, 'image/jpeg', 0.95);
  });
}

/**
 * Create an image element from a source URL
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => {
      console.error('Image load error:', error);
      reject(error);
    });
    // Don't set crossOrigin for data URLs
    if (!url.startsWith('data:')) {
      image.setAttribute('crossOrigin', 'anonymous');
    }
    image.src = url;
  });
}

/**
 * Read file as data URL
 */
export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string));
    reader.addEventListener('error', reject);
    reader.readAsDataURL(file);
  });
}
