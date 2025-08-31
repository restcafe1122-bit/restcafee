// Utility for handling image uploads to local storage (Base64 method)
export const uploadImageToLocal = async (file) => {
  try {
    // Convert image to Base64
    const base64 = await fileToBase64(file);
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `menu-item-${timestamp}.${fileExtension}`;
    
    // Store in localStorage with a unique key
    const imageKey = `menu_image_${timestamp}`;
    localStorage.setItem(imageKey, base64);
    
    return {
      success: true,
      path: base64, // Return Base64 data as path
      fileName: fileName,
      storageKey: imageKey
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('خطا در آپلود تصویر: ' + error.message);
  }
};

// Function to convert file to Base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// Function to validate image file
export const validateImageFile = (file) => {
  const errors = [];
  
  // Check file type
  if (!file.type.startsWith('image/')) {
    errors.push('فایل انتخاب شده تصویر نیست');
  }
  
  // Check file size (max 2MB for Base64 storage)
  if (file.size > 2 * 1024 * 1024) {
    errors.push('حجم فایل نباید بیشتر از 2 مگابایت باشد');
  }
  
  // Check file extension
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const fileExtension = file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    errors.push('فرمت فایل پشتیبانی نمی‌شود. فرمت‌های مجاز: JPG, PNG, GIF, WebP');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

// Function to create image preview
export const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

// Function to get image from storage
export const getImageFromStorage = (imagePath) => {
  // If it's a Base64 string, return it directly
  if (imagePath && imagePath.startsWith('data:image/')) {
    return imagePath;
  }
  
  // If it's a storage key, get from localStorage
  if (imagePath && imagePath.startsWith('menu_image_')) {
    return localStorage.getItem(imagePath);
  }
  
  // If it's a URL, return it
  if (imagePath && (imagePath.startsWith('http') || imagePath.startsWith('/'))) {
    return imagePath;
  }
  
  // Return default image
  return '/sample-coffee.jpg';
};

// Function to clean up old images from localStorage
export const cleanupOldImages = () => {
  const keys = Object.keys(localStorage);
  const imageKeys = keys.filter(key => key.startsWith('menu_image_'));
  
  // Keep only the last 50 images to prevent localStorage overflow
  if (imageKeys.length > 50) {
    const sortedKeys = imageKeys.sort((a, b) => {
      const timestampA = parseInt(a.split('_')[2]);
      const timestampB = parseInt(b.split('_')[2]);
      return timestampB - timestampA;
    });
    
    // Remove old images
    sortedKeys.slice(50).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}; 