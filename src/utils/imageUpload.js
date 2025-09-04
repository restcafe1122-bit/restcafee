// Utility for handling image uploads to local storage (Base64 method)
export const uploadImageToLocal = async (file, type = 'menu') => {
  try {
    // Convert image to Base64
    const base64 = await fileToBase64(file);
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${type}-${timestamp}.${fileExtension}`;
    
    // Store in localStorage with a unique key
    const imageKey = `${type}_image_${timestamp}`;
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

// Upload image to server storage via REST API (preferred for multi-device)
export const uploadImageToServer = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Server responded with ${response.status}. ${errorBody}`);
    }

    const result = await response.json();
    return {
      success: true,
      path: result?.path || result?.url,
      fileName: result?.fileName || result?.filename,
      size: result?.size
    };
  } catch (error) {
    console.error('Error uploading image to server:', error);
    throw new Error('خطا در آپلود تصویر روی سرور: ' + error.message);
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
  
  // Check file size (max 6MB for Base64 storage)
  if (file.size > 6 * 1024 * 1024) {
    errors.push('حجم فایل نباید بیشتر از 6 مگابایت باشد');
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

// Convert Base64 dataURL to File object
export const dataUrlToFile = (dataUrl, fileName = `image-${Date.now()}.png`) => {
  try {
    if (!dataUrl || !dataUrl.startsWith('data:')) return null;
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  } catch (e) {
    console.error('dataUrlToFile error:', e);
    return null;
  }
};
// Function to get image from storage
export const getImageFromStorage = (imagePath) => {
  // If it's a Base64 string, return it directly
  if (imagePath && imagePath.startsWith('data:image/')) {
    return imagePath;
  }
  
  // If it's a storage key, get from localStorage
  if (imagePath && (imagePath.startsWith('menu_image_') || imagePath.startsWith('cafe_image_'))) {
    return localStorage.getItem(imagePath);
  }
  
  // If it's a URL (absolute or server path), return it
  if (imagePath && (imagePath.startsWith('http') || imagePath.startsWith('/'))) {
    return imagePath;
  }
  
  // Return default image
  return '/sample-coffee.jpg';
};

// Function to clean up old images from localStorage
export const cleanupOldImages = () => {
  const keys = Object.keys(localStorage);
  const imageKeys = keys.filter(key => key.startsWith('menu_image_') || key.startsWith('cafe_image_'));
  
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