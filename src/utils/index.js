// Utility function for combining class names
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// URL creation utility
export const createPageUrl = (pageName) => {
  const pageUrls = {
    Menu: "/menu",
    AdminLogin: "/admin/login",
    AdminDashboard: "/admin/dashboard"
  };
  
  return pageUrls[pageName] || "/";
};

// Price formatting utility
export const formatPrice = (price) => {
  if (!price && price !== 0) return "0";
  return new Intl.NumberFormat('fa-IR').format(price);
};

// Category display names
export const getCategoryDisplayName = (categoryId) => {
  const categories = {
    coffee: "قهوه",
    shake: "شیک",
    cold_bar: "بار سرد",
    hot_bar: "بار گرم",
    tea: "چای",
    cake: "کیک",
    food: "غذا",
    breakfast: "صبحانه"
  };
  
  return categories[categoryId] || categoryId;
};

// Category emojis
export const getCategoryEmoji = (categoryId) => {
  const emojis = {
    coffee: "☕",
    shake: "🥤",
    cold_bar: "🧊",
    hot_bar: "🔥",
    tea: "🍃",
    cake: "🍰",
    food: "🍽️",
    breakfast: "🌅"
  };
  
  return emojis[categoryId] || "🍽️";
};

// Category colors
export const getCategoryColor = (categoryId) => {
  const colors = {
    coffee: "from-amber-400 to-orange-500",
    shake: "from-pink-400 to-rose-500",
    cold_bar: "from-sky-400 to-blue-500",
    hot_bar: "from-red-500 to-orange-500",
    tea: "from-lime-400 to-green-500",
    cake: "from-fuchsia-500 to-pink-600",
    food: "from-indigo-400 to-purple-500",
    breakfast: "from-yellow-400 to-amber-500"
  };
  
  return colors[categoryId] || "from-gray-400 to-gray-600";
};

// Local storage utilities
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      console.log(`Storage: Getting '${key}'`);
      const item = localStorage.getItem(key);
      if (item === null) {
        console.log(`Storage: Key '${key}' not found, returning default:`, defaultValue);
        return defaultValue;
      }
      const parsed = JSON.parse(item);
      console.log(`Storage: Retrieved '${key}':`, parsed);
      return parsed;
    } catch (error) {
      console.error(`Storage: Error reading '${key}':`, error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      console.log(`Storage: Setting '${key}' with value:`, value);
      
      if (value === undefined || value === null) {
        console.warn(`Storage: Attempting to save null/undefined value for '${key}'`);
        return;
      }
      
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      console.log(`Storage: Saved '${key}' successfully`);
      console.log(`Storage: Serialized data length:`, serialized.length);
      
      // Verify the data was saved correctly
      const saved = localStorage.getItem(key);
      if (saved === serialized) {
        console.log(`Storage: Data verified for '${key}'`);
      } else {
        console.warn(`Storage: Data verification failed for '${key}'`);
        console.warn(`Expected:`, serialized);
        console.warn(`Actual:`, saved);
      }
    } catch (error) {
      console.error(`Storage: Error saving '${key}':`, error);
      throw error;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      console.log(`Storage: Removed '${key}'`);
    } catch (error) {
      console.error(`Storage: Error removing '${key}':`, error);
    }
  },
  
  // Clear all data
  clear: () => {
    try {
      localStorage.clear();
      console.log("Storage: All data cleared");
    } catch (error) {
      console.error("Storage: Error clearing data:", error);
    }
  }
};

// Validation utilities
export const validateMenuItem = (item) => {
  const errors = [];
  
  if (!item.name || item.name.trim().length < 2) {
    errors.push("نام آیتم باید حداقل 2 کاراکتر باشد");
  }
  
  if (!item.category) {
    errors.push("دسته‌بندی باید انتخاب شود");
  }
  
  if (!item.price || item.price <= 0) {
    errors.push("قیمت باید بیشتر از صفر باشد");
  }
  
  return errors;
};

// Image utilities
export const getImageUrl = (url) => {
  if (!url) return '/placeholder-food.jpg';
  if (url.startsWith('http')) return url;
  return url;
};

// Export image upload utilities
export { 
  uploadImageToLocal, 
  validateImageFile, 
  createImagePreview, 
  getImageFromStorage, 
  cleanupOldImages 
} from './imageUpload'; 