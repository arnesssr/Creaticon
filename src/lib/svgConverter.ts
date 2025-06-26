import { saveAs } from 'file-saver';

export type ConversionFormat = 'png' | 'jpg' | 'jpeg' | 'webp' | 'ico';

export interface ConversionOptions {
  format: ConversionFormat;
  size: number;
  backgroundColor?: string;
  quality?: number; // For JPG/JPEG (0.1 to 1.0)
}

export const convertSvgToFormat = async (
  svgContent: string,
  filename: string,
  options: ConversionOptions
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new image element
      const img = new Image();
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Set canvas size
      canvas.width = options.size;
      canvas.height = options.size;

      img.onload = () => {
        try {
          // Clear canvas and set background if needed
          if (options.backgroundColor && (options.format === 'jpg' || options.format === 'jpeg')) {
            ctx.fillStyle = options.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          // Draw the SVG image onto canvas
          ctx.drawImage(img, 0, 0, options.size, options.size);

          // Convert to blob based on format
          let mimeType: string;
          let quality: number | undefined;

          switch (options.format) {
            case 'png':
              mimeType = 'image/png';
              break;
            case 'jpg':
            case 'jpeg':
              mimeType = 'image/jpeg';
              quality = options.quality || 0.9;
              break;
            case 'webp':
              mimeType = 'image/webp';
              quality = options.quality || 0.9;
              break;
            case 'ico':
              mimeType = 'image/png'; // ICO will be handled specially
              break;
            default:
              mimeType = 'image/png';
          }

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const finalFilename = `${filename}.${options.format}`;
                saveAs(blob, finalFilename);
                resolve();
              } else {
                reject(new Error('Failed to create blob'));
              }
            },
            mimeType,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load SVG image'));
      };

      // Convert SVG to data URL
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      img.src = url;

      // Clean up URL after image loads
      img.onload = (originalOnload => function(this: HTMLImageElement, ev: Event) {
        URL.revokeObjectURL(url);
        return originalOnload?.call(this, ev);
      })(img.onload);

    } catch (error) {
      reject(error);
    }
  });
};

export const convertSvgToMultipleFormats = async (
  svgContent: string,
  filename: string,
  formats: ConversionOptions[]
): Promise<void> => {
  const promises = formats.map(options => 
    convertSvgToFormat(svgContent, filename, options)
  );
  
  await Promise.all(promises);
};

// Preset conversion options
export const presetSizes = [16, 24, 32, 48, 64, 96, 128, 256, 512];
export const presetFormats: ConversionFormat[] = ['png', 'jpg', 'webp', 'ico'];

export const generateIconPack = async (
  svgContent: string,
  filename: string,
  selectedFormats: ConversionFormat[],
  selectedSizes: number[]
): Promise<void> => {
  const conversions: ConversionOptions[] = [];
  
  selectedFormats.forEach(format => {
    selectedSizes.forEach(size => {
      conversions.push({
        format,
        size,
        backgroundColor: format === 'jpg' ? '#ffffff' : undefined,
        quality: 0.9
      });
    });
  });

  await convertSvgToMultipleFormats(svgContent, filename, conversions);
};
