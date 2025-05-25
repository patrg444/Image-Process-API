require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const imageRoutes = require('./routes/imageRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', { stream: logger.stream }));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API info endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Image Processing API',
    version: '1.0.0',
    endpoints: {
      'POST /api/remove-background': 'Remove image background',
      'POST /api/compress': 'Compress images with quality settings',
      'POST /api/convert': 'Convert between formats (JPEG, PNG, WebP, AVIF)',
      'POST /api/transform': 'Resize, crop, rotate operations',
      'POST /api/watermark': 'Add text/image watermarks',
      'POST /api/enhance': 'AI upscaling and enhancement'
    },
    documentation: 'https://rapidapi.com/your-api-docs'
  });
});

// API routes
app.use('/api', imageRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found.'
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Image Processing API server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    logger.info('HTTP server closed');
  });
});

module.exports = app;
