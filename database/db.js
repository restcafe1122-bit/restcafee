import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file paths
const DB_DIR = path.join(__dirname, 'data');
const MENU_ITEMS_FILE = path.join(DB_DIR, 'menu-items.json');
const CAFE_SETTINGS_FILE = path.join(DB_DIR, 'cafe-settings.json');
const USERS_FILE = path.join(DB_DIR, 'users.json');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Database utility functions
export class Database {
  static async readFile(filePath, defaultValue = []) {
    try {
      if (!fs.existsSync(filePath)) {
        await this.writeFile(filePath, defaultValue);
        return defaultValue;
      }
      
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return defaultValue;
    }
  }

  static async writeFile(filePath, data) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error(`Error writing file ${filePath}:`, error);
      throw error;
    }
  }

  // Menu Items operations
  static async getMenuItems() {
    return await this.readFile(MENU_ITEMS_FILE, []);
  }

  static async saveMenuItems(items) {
    return await this.writeFile(MENU_ITEMS_FILE, items);
  }

  static async addMenuItem(item) {
    const items = await this.getMenuItems();
    const newItem = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      ...item,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    items.push(newItem);
    await this.saveMenuItems(items);
    return newItem;
  }

  static async updateMenuItem(id, updates) {
    const items = await this.getMenuItems();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Menu item not found');
    }
    
    items[index] = {
      ...items[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    await this.saveMenuItems(items);
    return items[index];
  }

  static async deleteMenuItem(id) {
    const items = await this.getMenuItems();
    const filteredItems = items.filter(item => item.id !== id);
    if (filteredItems.length === items.length) {
      throw new Error('Menu item not found');
    }
    await this.saveMenuItems(filteredItems);
    return true;
  }

  // Cafe Settings operations
  static async getCafeSettings() {
    const settings = await this.readFile(CAFE_SETTINGS_FILE, []);
    return settings.length > 0 ? settings[0] : null;
  }

  static async saveCafeSettings(settings) {
    const settingsArray = [{
      id: 'default',
      ...settings,
      updated_at: new Date().toISOString()
    }];
    return await this.writeFile(CAFE_SETTINGS_FILE, settingsArray);
  }

  // Users operations (for admin authentication)
  static async getUsers() {
    return await this.readFile(USERS_FILE, []);
  }

  static async saveUsers(users) {
    return await this.writeFile(USERS_FILE, users);
  }

  static async findUserByUsername(username) {
    const users = await this.getUsers();
    return users.find(user => user.username === username);
  }

  static async createUser(userData) {
    const users = await this.getUsers();
    const newUser = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    users.push(newUser);
    await this.saveUsers(users);
    return newUser;
  }

  // Initialize default data
  static async initializeDefaultData() {
    try {
      // Check if menu items exist
      const menuItems = await this.getMenuItems();
      if (menuItems.length === 0) {
        console.log('Initializing default menu items...');
        const defaultMenuItems = await this.getDefaultMenuItems();
        await this.saveMenuItems(defaultMenuItems);
      }

      // Check if cafe settings exist
      const cafeSettings = await this.getCafeSettings();
      if (!cafeSettings) {
        console.log('Initializing default cafe settings...');
        const defaultSettings = this.getDefaultCafeSettings();
        await this.saveCafeSettings(defaultSettings);
      }

      // Check if admin user exists
      const adminUser = await this.findUserByUsername('admin');
      if (!adminUser) {
        console.log('Creating default admin user...');
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash('rest2024', 10);
        await this.createUser({
          username: 'admin',
          password: hashedPassword,
          role: 'admin'
        });
      }

      console.log('Database initialization completed successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  static getDefaultCafeSettings() {
    return {
      cafe_name: "کافه رست",
      location: "اردبیل",
      description: "بهترین قهوه و شیک در اردبیل با کیفیت عالی و طعم بی‌نظیر",
      phone: "09123456789",
      instagram_url: "https://instagram.com/caferest",
      hero_image_url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
      logo_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200",
      admin_username: "admin",
      admin_password: "rest2024",
      created_at: new Date().toISOString()
    };
  }

  static async getDefaultMenuItems() {
    return [
      // Coffee Category - قهوه
      {
        name: "اسپرسو (قیمت عادی: لاین 50-50)",
        category: "coffee",
        price: 45000,
        price_premium: 55000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1514432320407-a09c9e4aef1d?w=400",
        order_index: 1,
        is_available: true
      },
      {
        name: "آیس آمریکانو",
        category: "coffee",
        price: 35000,
        price_premium: 45000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
        order_index: 2,
        is_available: true
      },
      {
        name: "آمریکانو",
        category: "coffee",
        price: 30000,
        price_premium: 40000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
        order_index: 3,
        is_available: true
      },
      {
        name: "کاپوچینو",
        category: "coffee",
        price: 40000,
        price_premium: 50000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400",
        order_index: 5,
        is_available: true
      },
      {
        name: "لته",
        category: "coffee",
        price: 42000,
        price_premium: 52000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400",
        order_index: 6,
        is_available: true
      },
      // Shake Category - شیک
      {
        name: "نوتلا",
        category: "shake",
        price: 65000,
        image_url: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400",
        order_index: 12,
        is_available: true
      },
      {
        name: "بادام",
        category: "shake",
        price: 60000,
        image_url: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400",
        order_index: 13,
        is_available: true
      },
      {
        name: "لوتوس",
        category: "shake",
        price: 70000,
        image_url: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400",
        order_index: 14,
        is_available: true
      },
      // Cold Bar Category - بار سرد
      {
        name: "ردگاردن",
        category: "cold_bar",
        price: 45000,
        image_url: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400",
        order_index: 20,
        is_available: true
      },
      {
        name: "لیموناد نعناع",
        category: "cold_bar",
        price: 40000,
        image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
        order_index: 21,
        is_available: true
      },
      // Tea Category - چای
      {
        name: "دمنوش",
        category: "tea",
        price: 35000,
        image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
        order_index: 32,
        is_available: true
      },
      {
        name: "ساده",
        category: "tea",
        price: 25000,
        image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
        order_index: 33,
        is_available: true
      },
      // Cake Category - کیک
      {
        name: "چیز کیک",
        category: "cake",
        price: 85000,
        image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
        order_index: 36,
        is_available: true
      },
      // Food Category - غذا
      {
        name: "پاستا",
        category: "food",
        price: 120000,
        image_url: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400",
        order_index: 41,
        is_available: true
      },
      {
        name: "سیب زمینی با سس مخصوص",
        category: "food",
        price: 65000,
        image_url: "https://images.unsplash.com/photo-1528735602786-469f3817357d?w=400",
        order_index: 42,
        is_available: true
      }
    ];
  }
}
