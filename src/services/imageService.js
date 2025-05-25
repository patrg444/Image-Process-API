const sharp = require('sharp');
const jimp = require('jimp');
const axios = require('axios');
const logger = require('../utils/logger');

class ImageService {
  /**
   * Compress an image
   * @param {Buffer} imageBuffer - Input image buffer
   * @param {Object} options - Compression options
   * @returns {Promise<Buffer>} - Compressed image buffer
   */
  async compress(imageBuffer, options = {}) {
    const { quality = 80, format } = options;
    
    try {
      let sharpInstance = sharp(imageBuffer);
      const metadata = await sharpInstance.metadata();
      
      // Apply format if specified
      if (format) {
        sharpInstance = sharpInstance.toFormat(format, { quality });
      } else {
        // Keep original format
        switch (metadata.format) {
          case 'jpeg':
          case 'jpg':
            sharpInstance = sharpInstance.jpeg({ quality });
            break;
          case 'png':
            sharpInstance = sharpInstance.png({ quality: Math.round(quality / 10) });
            break;
          case 'webp':
            sharpInstance = sharpInstance.webp({ quality });
            break;
          default:
            sharpInstance = sharpInstance.jpeg({ quality });
        }
      }
      
      return await sharpInstance.toBuffer();
    } catch (error) {
      logger.error('Compression error:', error);
      throw new Error('Failed to compress image');
    }
  }

  /**
   * Convert image format
   * @param {Buffer} imageBuffer - Input image buffer
   * @param {Object} options - Conversion options
   * @returns {Promise<Buffer>} - Converted image buffer
   */
  async convert(imageBuffer, options = {}) {
    const { format = 'jpeg', quality = 90 } = options;
    
    try {
      let sharpInstance = sharp(imageBuffer);
      
      switch (format) {
        case 'jpeg':
        case 'jpg':
          sharpInstance = sharpInstance.jpeg({ quality });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ quality: Math.round(quality / 10) });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality });
          break;
        case 'avif':
          sharpInstance = sharpInstance.avif({ quality });
          break;
        case 'tiff':
          sharpInstance = sharpInstance.tiff({ quality });
          break;
        case 'bmp':
          // Sharp doesn't support BMP directly, use JPEG as fallback
          sharpInstance = sharpInstance.jpeg({ quality });
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
      
      return await sharpInstance.toBuffer();
    } catch (error) {
      logger.error('Conversion error:', error);
      throw new Error('Failed to convert image format');
    }
  }

  /**
   * Transform image (resize, crop, rotate)
   * @param {Buffer} imageBuffer - Input image buffer
   * @param {Object} options - Transformation options
   * @returns {Promise<Buffer>} - Transformed image buffer
   */
  async transform(imageBuffer, options = {}) {
    const { width, height, fit = 'cover', rotate, flip, flop, crop } = options;
    
    try {
      let sharpInstance = sharp(imageBuffer);
      
      // Apply resize if dimensions provided
      if (width || height) {
        sharpInstance = sharpInstance.resize(width, height, { fit });
      }
      
      // Apply rotation
      if (rotate) {
        sharpInstance = sharpInstance.rotate(rotate);
      }
      
      // Apply flip (vertical)
      if (flip) {
        sharpInstance = sharpInstance.flip();
      }
      
      // Apply flop (horizontal)
      if (flop) {
        sharpInstance = sharpInstance.flop();
      }
      
      // Apply crop
      if (crop) {
        sharpInstance = sharpInstance.extract({
          left: crop.left,
          top: crop.top,
          width: crop.width,
          height: crop.height
        });
      }
      
      return await sharpInstance.toBuffer();
    } catch (error) {
      logger.error('Transform error:', error);
      throw new Error('Failed to transform image');
    }
  }

  /**
   * Add watermark to image
   * @param {Buffer} imageBuffer - Input image buffer
   * @param {Object} options - Watermark options
   * @returns {Promise<Buffer>} - Watermarked image buffer
   */
  async addWatermark(imageBuffer, options = {}) {
    const {
      text,
      position = 'bottom-right',
      opacity = 0.8,
      fontSize = 20,
      fontColor = '#FFFFFF',
      backgroundColor
    } = options;
    
    try {
      // Use Jimp for text watermarking
      const image = await jimp.read(imageBuffer);
      const font = await jimp.loadFont(
        fontSize > 32 ? jimp.FONT_SANS_64_WHITE : jimp.FONT_SANS_32_WHITE
      );
      
      // Calculate position
      const textWidth = jimp.measureText(font, text);
      const textHeight = jimp.measureTextHeight(font, text);
      let x = 10, y = 10;
      
      switch (position) {
        case 'center':
          x = (image.bitmap.width - textWidth) / 2;
          y = (image.bitmap.height - textHeight) / 2;
          break;
        case 'top':
          x = (image.bitmap.width - textWidth) / 2;
          y = 10;
          break;
        case 'bottom':
          x = (image.bitmap.width - textWidth) / 2;
          y = image.bitmap.height - textHeight - 10;
          break;
        case 'left':
          x = 10;
          y = (image.bitmap.height - textHeight) / 2;
          break;
        case 'right':
          x = image.bitmap.width - textWidth - 10;
          y = (image.bitmap.height - textHeight) / 2;
          break;
        case 'top-left':
          x = 10;
          y = 10;
          break;
        case 'top-right':
          x = image.bitmap.width - textWidth - 10;
          y = 10;
          break;
        case 'bottom-left':
          x = 10;
          y = image.bitmap.height - textHeight - 10;
          break;
        case 'bottom-right':
          x = image.bitmap.width - textWidth - 10;
          y = image.bitmap.height - textHeight - 10;
          break;
      }
      
      // Add text with background if specified
      if (backgroundColor) {
        // Create a rectangle background
        const bgImage = new jimp(textWidth + 20, textHeight + 10, backgroundColor);
        bgImage.opacity(opacity);
        image.composite(bgImage, x - 10, y - 5);
      }
      
      // Add text
      image.print(font, x, y, {
        text: text,
        alignmentX: jimp.HORIZONTAL_ALIGN_LEFT,
        alignmentY: jimp.VERTICAL_ALIGN_TOP
      });
      
      image.opacity(opacity);
      
      // Convert back to buffer
      return await image.getBufferAsync(jimp.MIME_PNG);
    } catch (error) {
      logger.error('Watermark error:', error);
      throw new Error('Failed to add watermark');
    }
  }

  /**
   * Remove background from image (simplified version)
   * @param {Buffer} imageBuffer - Input image buffer
   * @param {Object} options - Background removal options
   * @returns {Promise<Buffer>} - Image with background removed
   */
  async removeBackground(imageBuffer, options = {}) {
    const { outputFormat = 'png', backgroundColor } = options;
    
    try {
      // Note: This is a simplified version. In production, you'd want to use
      // a proper background removal service like remove.bg API or 
      // a machine learning model like U²-Net
      
      // For now, we'll create a simple version that makes white backgrounds transparent
      const image = await jimp.read(imageBuffer);
      
      // Simple white background removal
      image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
        const red = this.bitmap.data[idx + 0];
        const green = this.bitmap.data[idx + 1];
        const blue = this.bitmap.data[idx + 2];
        
        // If pixel is close to white, make it transparent
        if (red > 240 && green > 240 && blue > 240) {
          this.bitmap.data[idx + 3] = 0; // Set alpha to 0
        }
      });
      
      // Add background color if specified
      if (backgroundColor) {
        const bg = new jimp(image.bitmap.width, image.bitmap.height, backgroundColor);
        bg.composite(image, 0, 0);
        image.bitmap = bg.bitmap;
      }
      
      // Convert to desired format
      const mimeType = outputFormat === 'webp' ? jimp.MIME_PNG : jimp.MIME_PNG;
      const outputBuffer = await image.getBufferAsync(mimeType);
      
      // If webp is requested, convert using sharp
      if (outputFormat === 'webp') {
        return await sharp(outputBuffer).webp().toBuffer();
      }
      
      return outputBuffer;
    } catch (error) {
      logger.error('Background removal error:', error);
      throw new Error('Failed to remove background');
    }
  }

  /**
   * Enhance image using AI (simplified version)
   * @param {Buffer} imageBuffer - Input image buffer
   * @param {Object} options - Enhancement options
   * @returns {Promise<Buffer>} - Enhanced image buffer
   */
  async enhance(imageBuffer, options = {}) {
    const { scale = 2, denoise = true, sharpen = false } = options;
    
    try {
      // Note: This is a simplified version. In production, you'd want to use
      // proper AI models like Real-ESRGAN or ESRGAN
      
      let sharpInstance = sharp(imageBuffer);
      const metadata = await sharpInstance.metadata();
      
      // Simple upscaling
      const newWidth = Math.round(metadata.width * scale);
      const newHeight = Math.round(metadata.height * scale);
      
      sharpInstance = sharpInstance.resize(newWidth, newHeight, {
        kernel: sharp.kernel.lanczos3,
        fastShrinkOnLoad: false
      });
      
      // Apply sharpening if requested
      if (sharpen) {
        sharpInstance = sharpInstance.sharpen();
      }
      
      // Apply noise reduction if requested
      if (denoise) {
        sharpInstance = sharpInstance.median(3);
      }
      
      return await sharpInstance.toBuffer();
    } catch (error) {
      logger.error('Enhancement error:', error);
      throw new Error('Failed to enhance image');
    }
  }
}

module.exports = new ImageService();
