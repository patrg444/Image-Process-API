const imageService = require('../services/imageService');
const logger = require('../utils/logger');

/**
 * Remove background from image
 */
const removeBackground = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image provided',
        message: 'Please upload an image file'
      });
    }

    const options = req.validatedBody || {};
    const result = await imageService.removeBackground(req.file.buffer, options);

    res.set({
      'Content-Type': options.outputFormat === 'webp' ? 'image/webp' : 'image/png',
      'Content-Length': result.length
    });

    res.send(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Compress image
 */
const compressImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image provided',
        message: 'Please upload an image file'
      });
    }

    const options = req.validatedBody || {};
    const result = await imageService.compress(req.file.buffer, options);

    const format = options.format || req.file.mimetype.split('/')[1];
    res.set({
      'Content-Type': `image/${format}`,
      'Content-Length': result.length
    });

    res.send(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Convert image format
 */
const convertFormat = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image provided',
        message: 'Please upload an image file'
      });
    }

    const options = req.validatedBody || {};
    const result = await imageService.convert(req.file.buffer, options);

    let contentType = `image/${options.format}`;
    if (options.format === 'jpg') contentType = 'image/jpeg';

    res.set({
      'Content-Type': contentType,
      'Content-Length': result.length
    });

    res.send(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Transform image (resize, crop, rotate)
 */
const transformImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image provided',
        message: 'Please upload an image file'
      });
    }

    const options = req.validatedBody || {};
    const result = await imageService.transform(req.file.buffer, options);

    res.set({
      'Content-Type': req.file.mimetype,
      'Content-Length': result.length
    });

    res.send(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Add watermark to image
 */
const addWatermark = async (req, res, next) => {
  try {
    const files = req.files;
    
    if (!files || !files.image || !files.image[0]) {
      return res.status(400).json({
        error: 'No image provided',
        message: 'Please upload an image file'
      });
    }

    const options = req.validatedBody || {};
    
    // If no text provided and no watermark image, return error
    if (!options.text && (!files.watermark || !files.watermark[0])) {
      return res.status(400).json({
        error: 'No watermark content provided',
        message: 'Please provide either text or a watermark image'
      });
    }

    const imageBuffer = files.image[0].buffer;
    
    // TODO: Add support for image watermarks
    if (files.watermark && files.watermark[0]) {
      // For now, we'll just use text watermarks
      logger.warn('Image watermarks not yet implemented, using text watermark');
    }

    const result = await imageService.addWatermark(imageBuffer, options);

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': result.length
    });

    res.send(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Enhance image using AI
 */
const enhanceImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image provided',
        message: 'Please upload an image file'
      });
    }

    const options = req.validatedBody || {};
    const result = await imageService.enhance(req.file.buffer, options);

    res.set({
      'Content-Type': req.file.mimetype,
      'Content-Length': result.length,
      'X-Enhancement-Scale': options.scale || 2
    });

    res.send(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  removeBackground,
  compressImage,
  convertFormat,
  transformImage,
  addWatermark,
  enhanceImage
};
