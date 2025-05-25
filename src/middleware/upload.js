const multer = require('multer');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|bmp|tiff|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files are allowed.'));
  }
};

// Configure upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only allow 1 file per request
  },
  fileFilter: fileFilter
});

// Export different upload configurations
module.exports = {
  single: upload.single('image'),
  multiple: upload.array('images', 10), // Max 10 files
  fields: upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'watermark', maxCount: 1 }
  ])
};
