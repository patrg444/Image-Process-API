const logger = require('../utils/logger');

// RapidAPI authentication middleware
const rapidAPIAuth = (req, res, next) => {
  const rapidApiKey = req.headers['x-rapidapi-key'];
  const rapidApiHost = req.headers['x-rapidapi-host'];
  const rapidApiUser = req.headers['x-rapidapi-user'];

  // In production, RapidAPI will send these headers
  if (process.env.NODE_ENV === 'production') {
    if (!rapidApiKey || !rapidApiHost) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing RapidAPI authentication headers'
      });
    }

    // Log API usage
    logger.info({
      type: 'api_request',
      user: rapidApiUser,
      endpoint: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  } else {
    // Development mode - check for API key
    const apiKey = req.headers['x-api-key'];
    if (process.env.REQUIRE_API_KEY === 'true' && apiKey !== process.env.DEV_API_KEY) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or missing API key'
      });
    }
  }

  next();
};

module.exports = { rapidAPIAuth };
