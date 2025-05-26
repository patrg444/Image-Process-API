# Image Processing API

A professional Image Processing API designed for deployment on Railway and monetization through RapidAPI. This API provides powerful image manipulation capabilities including background removal, compression, format conversion, transformations, watermarking, and AI enhancement.

## Features

### Background Removal
- Remove white backgrounds from images
- Support for PNG and WebP output
- Optional background color replacement

###  Image Compression
- Adjustable quality settings (1-100)
- Maintains original format or converts
- Optimized file sizes

### Format Conversion
- Support for JPEG, PNG, WebP, AVIF, TIFF, BMP
- Quality control for lossy formats
- Automatic optimization

### Image Transformation
- Resize with multiple fit options (cover, contain, fill, inside, outside)
- Crop with precise coordinates
- Rotate (0°, 90°, 180°, 270°)
- Flip and flop operations

### Watermarking
- Text watermarks with customizable positioning
- Adjustable opacity, font size, and colors
- 9 position presets

### AI Enhancement
- Image upscaling (1x-4x)
- Noise reduction
- Sharpening filters

## API Endpoints

| Endpoint | Method | Description |
|----------|---------|------------|
| `/api/remove-background` | POST | Remove image background |
| `/api/compress` | POST | Compress images |
| `/api/convert` | POST | Convert image formats |
| `/api/transform` | POST | Resize, crop, rotate images |
| `/api/watermark` | POST | Add watermarks to images |
| `/api/enhance` | POST | AI-powered image enhancement |

## Installation

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/image-processing-api.git
cd image-processing-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Usage Examples

### Background Removal
```bash
curl -X POST http://localhost:3000/api/remove-background \
  -H "x-api-key: your-api-key" \
  -F "image=@input.jpg" \
  -F "outputFormat=png" \
  --output output.png
```

### Image Compression
```bash
curl -X POST http://localhost:3000/api/compress \
  -H "x-api-key: your-api-key" \
  -F "image=@input.jpg" \
  -F "quality=80" \
  --output compressed.jpg
```

### Format Conversion
```bash
curl -X POST http://localhost:3000/api/convert \
  -H "x-api-key: your-api-key" \
  -F "image=@input.png" \
  -F "format=webp" \
  -F "quality=90" \
  --output output.webp
```

### Image Transformation
```bash
curl -X POST http://localhost:3000/api/transform \
  -H "x-api-key: your-api-key" \
  -F "image=@input.jpg" \
  -F "width=800" \
  -F "height=600" \
  -F "fit=cover" \
  --output transformed.jpg
```

### Watermarking
```bash
curl -X POST http://localhost:3000/api/watermark \
  -H "x-api-key: your-api-key" \
  -F "image=@input.jpg" \
  -F "text=© YourBrand" \
  -F "position=bottom-right" \
  -F "opacity=0.8" \
  --output watermarked.png
```

### AI Enhancement
```bash
curl -X POST http://localhost:3000/api/enhance \
  -H "x-api-key: your-api-key" \
  -F "image=@input.jpg" \
  -F "scale=2" \
  -F "denoise=true" \
  --output enhanced.jpg
```

## Deployment to Railway

### Prerequisites
- [Railway account](https://railway.app)
- [Railway CLI](https://docs.railway.app/develop/cli) (optional)

### Deployment Steps

1. **Via GitHub (Recommended)**
   - Push your code to a GitHub repository
   - Connect your Railway account to GitHub
   - Create a new project on Railway
   - Select your repository
   - Railway will automatically detect the Dockerfile and deploy

2. **Via Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway init

# Deploy
railway up
```

3. **Environment Variables**
   - Set the following in Railway dashboard:
   ```
   NODE_ENV=production
   PORT=3000
   ALLOWED_ORIGINS=https://rapidapi.com
   ```

## Setting up on RapidAPI

### 1. Create RapidAPI Account
- Sign up at [RapidAPI](https://rapidapi.com/provider)
- Complete provider profile

### 2. Add Your API

1. Click "Add New API"
2. Fill in API details:
   - **Name**: Image Processing API
   - **Category**: Tools
   - **Description**: Professional image processing with background removal, compression, and more
   - **Website**: Your Railway deployment URL

### 3. Configure Endpoints

For each endpoint, add:

**Example: Background Removal**
- **Endpoint**: `/api/remove-background`
- **Method**: POST
- **Description**: Remove background from images
- **Headers**:
  - `Content-Type`: multipart/form-data
- **Parameters**:
  - `image` (file, required): The image file
  - `outputFormat` (string, optional): Output format (png/webp)
  - `backgroundColor` (string, optional): Hex color for background

### 4. Set Base URL
- Use your Railway deployment URL as the base URL
- Example: `https://your-app.railway.app`

### 5. Configure Authentication
- RapidAPI automatically adds authentication headers
- Your API checks for `x-rapidapi-key` in production

### 6. Pricing Plans

Create pricing tiers:
- **Basic** (Free): 100 requests/month
- **Pro** ($9.99/month): 1,000 requests/month
- **Business** ($49.99/month): 10,000 requests/month
- **Enterprise** (Custom): Unlimited requests

### 7. Testing
- Use RapidAPI's testing interface
- Provide example images
- Document response formats

## Error Handling

The API returns consistent error responses:

```json
{
  "error": {
    "message": "Error description",
    "status": 400,
    "timestamp": "2025-01-24T12:00:00.000Z"
  }
}
```

Common status codes:
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (missing/invalid API key)
- `413`: File too large (max 10MB)
- `429`: Too many requests
- `500`: Internal server error

## Performance Considerations

- Maximum file size: 10MB
- Supported formats: JPEG, PNG, GIF, WebP, BMP, TIFF, SVG
- Rate limiting: 100 requests per 15 minutes per IP
- Processing timeout: 30 seconds

## Advanced Configuration

### Using External Background Removal API

To use remove.bg instead of the built-in solution:

1. Get API key from [remove.bg](https://www.remove.bg/api)
2. Add to environment variables:
```
REMOVE_BG_API_KEY=your-api-key
REMOVE_BG_API_URL=https://api.remove.bg/v1.0/removebg
```

3. Update `imageService.js` to use the external API

### Custom Rate Limiting

Modify in `.env`:
```
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # requests per window
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- Documentation: [API Docs](https://rapidapi.com/your-api-docs)
- Issues: [GitHub Issues](https://github.com/yourusername/image-processing-api/issues)
- Email: support@yourapi.com

## Roadmap

- [ ] Batch processing support
- [ ] Video frame extraction
- [ ] Advanced AI models integration
- [ ] WebSocket support for real-time processing
- [ ] Image analysis and metadata extraction
- [ ] Face detection and blurring
- [ ] QR code generation and reading
