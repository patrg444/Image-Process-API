const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { validate } = require('../middleware/validation');
const { rapidAPIAuth } = require('../middleware/auth');

// Import controllers
const {
  removeBackground,
  compressImage,
  convertFormat,
  transformImage,
  addWatermark,
  enhanceImage
} = require('../controllers/imageController');

// Apply authentication to all routes
router.use(rapidAPIAuth);

// Background removal endpoint
router.post('/remove-background',
  upload.single,
  validate('removeBackground'),
  removeBackground
);

// Image compression endpoint
router.post('/compress',
  upload.single,
  validate('compress'),
  compressImage
);

// Format conversion endpoint
router.post('/convert',
  upload.single,
  validate('convert'),
  convertFormat
);

// Image transformation endpoint (resize, crop, rotate)
router.post('/transform',
  upload.single,
  validate('transform'),
  transformImage
);

// Watermark endpoint
router.post('/watermark',
  upload.fields,
  validate('watermark'),
  addWatermark
);

// AI enhancement endpoint
router.post('/enhance',
  upload.single,
  validate('enhance'),
  enhanceImage
);

module.exports = router;
