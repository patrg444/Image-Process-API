const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Create a simple test image
const createTestImage = () => {
  const sharp = require('sharp');
  return sharp({
    create: {
      width: 300,
      height: 200,
      channels: 3,
      background: { r: 255, g: 255, b: 255 }
    }
  })
  .composite([{
    input: Buffer.from(
      '<svg><rect x="50" y="50" width="200" height="100" fill="blue"/><text x="150" y="110" font-size="30" text-anchor="middle" fill="white">TEST</text></svg>'
    ),
    top: 0,
    left: 0
  }])
  .png()
  .toBuffer();
};

const testAPI = async () => {
  const baseURL = 'http://localhost:3000';
  
  try {
    // Create test image
    const testImage = await createTestImage();
    fs.writeFileSync('test-image.png', testImage);
    console.log('✅ Created test image');

    // Test health endpoint
    const health = await axios.get(`${baseURL}/health`);
    console.log('✅ Health check:', health.data);

    // Test compression
    const formData = new FormData();
    formData.append('image', testImage, 'test.png');
    formData.append('quality', '80');
    
    const compressed = await axios.post(`${baseURL}/api/compress`, formData, {
      headers: {
        ...formData.getHeaders(),
        'x-api-key': 'test-key'
      },
      responseType: 'arraybuffer'
    });
    
    fs.writeFileSync('test-compressed.png', compressed.data);
    console.log('✅ Compression test completed');

    // Test format conversion
    const convertForm = new FormData();
    convertForm.append('image', testImage, 'test.png');
    convertForm.append('format', 'webp');
    
    const converted = await axios.post(`${baseURL}/api/convert`, convertForm, {
      headers: {
        ...convertForm.getHeaders(),
        'x-api-key': 'test-key'
      },
      responseType: 'arraybuffer'
    });
    
    fs.writeFileSync('test-converted.webp', converted.data);
    console.log('✅ Format conversion test completed');

    console.log('\n🎉 All tests passed! API is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI, createTestImage };
