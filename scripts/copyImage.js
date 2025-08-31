const fs = require('fs');
const path = require('path');

// Function to copy image file to public/images directory
function copyImageToPublic(sourcePath, fileName) {
  const publicImagesDir = path.join(__dirname, '../public/images');
  const destinationPath = path.join(publicImagesDir, fileName);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(publicImagesDir)) {
    fs.mkdirSync(publicImagesDir, { recursive: true });
  }
  
  // Copy file
  fs.copyFileSync(sourcePath, destinationPath);
  console.log(`Image copied to: ${destinationPath}`);
  
  return `/images/${fileName}`;
}

// Export for use in other scripts
module.exports = { copyImageToPublic };

// If run directly, copy a test image
if (require.main === module) {
  const testImagePath = process.argv[2];
  const fileName = process.argv[3];
  
  if (testImagePath && fileName) {
    try {
      const result = copyImageToPublic(testImagePath, fileName);
      console.log('Image copied successfully:', result);
    } catch (error) {
      console.error('Error copying image:', error);
    }
  } else {
    console.log('Usage: node copyImage.js <sourcePath> <fileName>');
  }
} 