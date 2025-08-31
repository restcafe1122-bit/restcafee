// Utility for handling image uploads to local storage
export const uploadImageToLocal = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('http://localhost:3001/api/upload-image', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'خطا در آپلود تصویر');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('خطا در آپلود تصویر: ' + error.message);
  }
};

// Function to validate image file
export const validateImageFile = (file) => {
  const errors = [];
  
  // Check file type
  if (!file.type.startsWith('image/')) {
    errors.push('فایل انتخاب شده تصویر نیست');
  }
  
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    errors.push('حجم فایل نباید بیشتر از 5 مگابایت باشد');
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