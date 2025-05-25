const Joi = require('joi');

// Validation schemas
const schemas = {
  compress: Joi.object({
    quality: Joi.number().min(1).max(100).default(80),
    format: Joi.string().valid('jpeg', 'jpg', 'png', 'webp').optional()
  }),
  
  convert: Joi.object({
    format: Joi.string().valid('jpeg', 'jpg', 'png', 'webp', 'avif', 'tiff', 'bmp').required(),
    quality: Joi.number().min(1).max(100).default(90)
  }),
  
  transform: Joi.object({
    width: Joi.number().min(1).max(10000).optional(),
    height: Joi.number().min(1).max(10000).optional(),
    fit: Joi.string().valid('cover', 'contain', 'fill', 'inside', 'outside').default('cover'),
    rotate: Joi.number().valid(0, 90, 180, 270).optional(),
    flip: Joi.boolean().optional(),
    flop: Joi.boolean().optional(),
    crop: Joi.object({
      left: Joi.number().min(0).required(),
      top: Joi.number().min(0).required(),
      width: Joi.number().min(1).required(),
      height: Joi.number().min(1).required()
    }).optional()
  }),
  
  watermark: Joi.object({
    text: Joi.string().max(100).optional(),
    position: Joi.string().valid('center', 'top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right').default('bottom-right'),
    opacity: Joi.number().min(0).max(1).default(0.8),
    fontSize: Joi.number().min(10).max(200).default(20),
    fontColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#FFFFFF'),
    backgroundColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional()
  }),
  
  enhance: Joi.object({
    scale: Joi.number().min(1).max(4).default(2),
    denoise: Joi.boolean().default(true),
    sharpen: Joi.boolean().default(false)
  }),
  
  removeBackground: Joi.object({
    outputFormat: Joi.string().valid('png', 'webp').default('png'),
    backgroundColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional()
  })
};

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schemas[schema].validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        error: 'Validation Error',
        details: errors
      });
    }
    
    req.validatedBody = value;
    next();
  };
};

module.exports = { validate };
