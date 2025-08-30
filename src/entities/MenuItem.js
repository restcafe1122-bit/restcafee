import { storage } from '../utils';

export class MenuItem {
  static STORAGE_KEY = 'menuItems';
  
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.name = data.name || '';
    this.category = data.category || '';
    this.price = data.price || 0;
    this.price_premium = data.price_premium || null;
    this.has_dual_pricing = data.has_dual_pricing || false;
    this.image_url = data.image_url || '';
    this.order_index = data.order_index || 0;
    this.is_available = data.is_available !== undefined ? data.is_available : true;
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }
  
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  static async create(data) {
    try {
      console.log("=== MenuItem.create() START ===");
      console.log("Input data:", data);
      
      // Validate input data
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid data provided to create method");
      }
      
      if (!data.name || data.name.trim() === '') {
        throw new Error("Item name is required");
      }
      
      // Create a new item with generated ID
      const newData = {
        id: data.id || Date.now().toString(36) + Math.random().toString(36).substr(2),
        name: data.name.trim(),
        category: data.category || 'coffee',
        price: parseInt(data.price) || 0,
        price_premium: data.has_dual_pricing ? (parseInt(data.price_premium) || 0) : null,
        has_dual_pricing: data.has_dual_pricing || false,
        image_url: data.image_url || '',
        order_index: data.order_index || 0,
        is_available: data.is_available !== undefined ? data.is_available : true,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      };
      
      console.log("Prepared new data:", newData);
      
      // Get existing items
      const existingItems = await this.list();
      console.log("Existing items count:", existingItems.length);
      console.log("Existing items:", existingItems);
      
      // Add new item to the list
      const updatedItems = [...existingItems, newData];
      console.log("Updated items count:", updatedItems.length);
      console.log("Updated items:", updatedItems);
      
      // Save the updated list
      await this.save(updatedItems);
      console.log("Items saved successfully");
      
      console.log("=== MenuItem.create() SUCCESS ===");
      return newData;
    } catch (error) {
      console.error("=== MenuItem.create() ERROR ===");
      console.error("Error details:", error);
      throw error;
    }
  }
  
  static async update(id, data) {
    const items = await this.list();
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...data, updated_at: new Date().toISOString() };
      await this.save(items);
      return items[index];
    }
    throw new Error('MenuItem not found');
  }
  
  static async delete(id) {
    const items = await this.list();
    const filtered = items.filter(item => item.id !== id);
    await this.save(filtered);
  }
  
  static async list() {
    return storage.get(this.STORAGE_KEY, []);
  }
  
  static async filter(criteria = {}, sortBy = null) {
    let items = await this.list();
    
    // Apply filters
    Object.keys(criteria).forEach(key => {
      if (criteria[key] !== undefined && criteria[key] !== null) {
        items = items.filter(item => item[key] === criteria[key]);
      }
    });
    
    // Apply sorting
    if (sortBy) {
      items.sort((a, b) => {
        if (typeof a[sortBy] === 'string') {
          return a[sortBy].localeCompare(b[sortBy]);
        }
        return a[sortBy] - b[sortBy];
      });
    }
    
    return items;
  }
  
  static async getById(id) {
    const items = await this.list();
    return items.find(item => item.id === id);
  }
  
  static async save(items) {
    try {
      console.log("=== MenuItem.save() START ===");
      console.log("Items to save:", items);
      console.log("Items count:", items.length);
      
      if (!Array.isArray(items)) {
        console.error("Items is not an array:", items);
        throw new Error("Items must be an array");
      }
      
      // Ensure all items have required properties
      const validatedItems = items.map((item, index) => {
        if (!item || typeof item !== 'object') {
          console.error(`Invalid item at index ${index}:`, item);
          return null;
        }
        
        if (!item.id) {
          console.warn("Item missing ID:", item);
          item.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        }
        
        // Ensure all required fields exist
        const validatedItem = {
          id: item.id,
          name: item.name || '',
          category: item.category || 'coffee',
          price: item.price || 0,
          price_premium: item.price_premium || null,
          has_dual_pricing: item.has_dual_pricing || false,
          image_url: item.image_url || '',
          order_index: item.order_index || 0,
          is_available: item.is_available !== undefined ? item.is_available : true,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString()
        };
        
        console.log(`Validated item ${index}:`, validatedItem);
        return validatedItem;
      }).filter(item => item !== null);
      
      console.log("Final validated items:", validatedItems);
      
      await storage.set(this.STORAGE_KEY, validatedItems);
      console.log("Menu items saved successfully");
      console.log("=== MenuItem.save() SUCCESS ===");
    } catch (error) {
      console.error("=== MenuItem.save() ERROR ===");
      console.error("Error details:", error);
      throw error;
    }
  }
  
  static async seed() {
    console.log("=== MenuItem.seed() START ===");
    const existing = await this.list();
    console.log("Existing items count:", existing.length);
    
    // Only seed if no data exists
    if (existing.length > 0) {
      console.log("Data already exists, skipping seed");
      console.log("=== MenuItem.seed() SKIPPED ===");
      return existing;
    }
    
    console.log("No existing data found, seeding new data...");
    
    const sampleItems = [
      // Coffee Category - قهوه
      {
        name: "اسپرسو لاین (قهوه 80/20 عربیکا)",
        category: "coffee",
        price: 45000,
        price_premium: 55000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1514432320407-a09c9e4aef1d?w=400",
        order_index: 1,
        is_available: true
      },
      {
        name: "آیس آمریکانو (قهوه 50/50 عربیکا)",
        category: "coffee",
        price: 35000,
        price_premium: 45000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
        order_index: 2,
        is_available: true
      },
      {
        name: "آمریکانو (قهوه 80/20 عربیکا)",
        category: "coffee",
        price: 30000,
        price_premium: 40000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
        order_index: 3,
        is_available: true
      },
      {
        name: "آفاگاتو (قهوه 50/50 عربیکا)",
        category: "coffee",
        price: 55000,
        price_premium: 65000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400",
        order_index: 4,
        is_available: true
      },
      {
        name: "کاپوچینو (قهوه 80/20 عربیکا)",
        category: "coffee",
        price: 40000,
        price_premium: 50000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400",
        order_index: 5,
        is_available: true
      },
      {
        name: "لته (قهوه 50/50 عربیکا)",
        category: "coffee",
        price: 42000,
        price_premium: 52000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400",
        order_index: 6,
        is_available: true
      },
      {
        name: "موکا (قهوه 80/20 عربیکا)",
        category: "coffee",
        price: 48000,
        price_premium: 58000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400",
        order_index: 7,
        is_available: true
      },
      {
        name: "ماکیاتو (قهوه 50/50 عربیکا)",
        category: "coffee",
        price: 38000,
        price_premium: 48000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1514432320407-a09c9e4aef1d?w=400",
        order_index: 8,
        is_available: true
      },
      {
        name: "آیس لته (قهوه 80/20 عربیکا)",
        category: "coffee",
        price: 45000,
        price_premium: 55000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400",
        order_index: 9,
        is_available: true
      },
      {
        name: "زومار (قهوه 50/50 عربیکا)",
        category: "coffee",
        price: 50000,
        price_premium: 60000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1514432320407-a09c9e4aef1d?w=400",
        order_index: 10,
        is_available: true
      },
      {
        name: "خیارپلو (قهوه 80/20 عربیکا)",
        category: "coffee",
        price: 52000,
        price_premium: 62000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1514432320407-a09c9e4aef1d?w=400",
        order_index: 11,
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
      {
        name: "OREO",
        category: "shake",
        price: 68000,
        image_url: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400",
        order_index: 15,
        is_available: true
      },
      {
        name: "نوستالژِ",
        category: "shake",
        price: 55000,
        image_url: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400",
        order_index: 16,
        is_available: true
      },
      {
        name: "بری",
        category: "shake",
        price: 58000,
        image_url: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400",
        order_index: 17,
        is_available: true
      },
      {
        name: "شکلات",
        category: "shake",
        price: 62000,
        image_url: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400",
        order_index: 18,
        is_available: true
      },
      {
        name: "قهوه",
        category: "shake",
        price: 50000,
        image_url: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400",
        order_index: 19,
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
      {
        name: "فروزن لایت",
        category: "cold_bar",
        price: 35000,
        image_url: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400",
        order_index: 22,
        is_available: true
      },
      {
        name: "مانگوپشن",
        category: "cold_bar",
        price: 48000,
        image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
        order_index: 23,
        is_available: true
      },
      {
        name: "آب نبات",
        category: "cold_bar",
        price: 42000,
        image_url: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400",
        order_index: 24,
        is_available: true
      },
      {
        name: "موهیتو",
        category: "cold_bar",
        price: 50000,
        image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
        order_index: 25,
        is_available: true
      },
      {
        name: "ترش",
        category: "cold_bar",
        price: 38000,
        image_url: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400",
        order_index: 26,
        is_available: true
      },
      
      // Hot Bar Category - بار گرم
      {
        name: "هات چاکلت",
        category: "hot_bar",
        price: 55000,
        image_url: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400",
        order_index: 27,
        is_available: true
      },
      {
        name: "یونانی",
        category: "hot_bar",
        price: 45000,
        image_url: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400",
        order_index: 28,
        is_available: true
      },
      {
        name: "شیرشکلات",
        category: "hot_bar",
        price: 50000,
        image_url: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400",
        order_index: 29,
        is_available: true
      },
      {
        name: "شیرنسکافه",
        category: "hot_bar",
        price: 48000,
        image_url: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400",
        order_index: 30,
        is_available: true
      },
      {
        name: "شیرکاکائو",
        category: "hot_bar",
        price: 52000,
        image_url: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400",
        order_index: 31,
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
      {
        name: "ماسالا",
        category: "tea",
        price: 40000,
        image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
        order_index: 34,
        is_available: true
      },
      {
        name: "ماچا",
        category: "tea",
        price: 45000,
        image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
        order_index: 35,
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
      {
        name: "دبل چاکلت",
        category: "cake",
        price: 95000,
        image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
        order_index: 37,
        is_available: true
      },
      {
        name: "فرانسوی",
        category: "cake",
        price: 90000,
        image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
        order_index: 38,
        is_available: true
      },
      {
        name: "هویج",
        category: "cake",
        price: 75000,
        image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
        order_index: 39,
        is_available: true
      },
      {
        name: "پای سیب",
        category: "cake",
        price: 80000,
        image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
        order_index: 40,
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
      },
      {
        name: "سالاد سزار",
        category: "food",
        price: 85000,
        image_url: "https://images.unsplash.com/photo-1528735602786-469f3817357d?w=400",
        order_index: 43,
        is_available: true
      },
      {
        name: "سالاد ویژه رست",
        category: "food",
        price: 95000,
        image_url: "https://images.unsplash.com/photo-1528735602786-469f3817357d?w=400",
        order_index: 44,
        is_available: true
      },
      {
        name: "سالاد ماکارونی",
        category: "food",
        price: 70000,
        image_url: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400",
        order_index: 45,
        is_available: true
      },
      
      // Breakfast Category - صبحانه
      {
        name: "صبحانه ایرانی",
        category: "breakfast",
        price: 150000,
        image_url: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400",
        order_index: 46,
        is_available: true
      },
      {
        name: "املت",
        category: "breakfast",
        price: 75000,
        image_url: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400",
        order_index: 47,
        is_available: true
      },
      {
        name: "املت سوجوک",
        category: "breakfast",
        price: 95000,
        image_url: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400",
        order_index: 48,
        is_available: true
      },
      {
        name: "صبحانه انگلیسی",
        category: "breakfast",
        price: 180000,
        image_url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
        order_index: 49,
        is_available: true
      },
      {
        name: "خوراک عدسی",
        category: "breakfast",
        price: 65000,
        image_url: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400",
        order_index: 50,
        is_available: true
      },
      {
        name: "نیمرو",
        category: "breakfast",
        price: 60000,
        image_url: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400",
        order_index: 51,
        is_available: true
      }
    ];
    
    console.log(`Creating ${sampleItems.length} menu items...`);
    
    // Save all items at once
    await this.save(sampleItems);
    
    console.log("Menu seeding completed successfully!");
    console.log("=== MenuItem.seed() SUCCESS ===");
    return sampleItems;
  }

  static async forceReseed() {
    console.log("=== MenuItem.forceReseed() START ===");
    console.log("Force reseeding data with updated names...");
    
    const sampleItems = [
      // Coffee Category - قهوه
      {
        name: "اسپرسو لاین (قهوه 80/20 عربیکا)",
        category: "coffee",
        price: 45000,
        price_premium: 55000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1514432320407-a09c9e4aef1d?w=400",
        order_index: 1,
        is_available: true
      },
      {
        name: "آیس آمریکانو (قهوه 50/50 عربیکا)",
        category: "coffee",
        price: 35000,
        price_premium: 45000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
        order_index: 2,
        is_available: true
      },
      {
        name: "آمریکانو (قهوه 80/20 عربیکا)",
        category: "coffee",
        price: 30000,
        price_premium: 40000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
        order_index: 3,
        is_available: true
      },
      {
        name: "آفاگاتو (قهوه 50/50 عربیکا)",
        category: "coffee",
        price: 55000,
        price_premium: 65000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400",
        order_index: 4,
        is_available: true
      },
      {
        name: "کاپوچینو (قهوه 80/20 عربیکا)",
        category: "coffee",
        price: 40000,
        price_premium: 50000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400",
        order_index: 5,
        is_available: true
      },
      {
        name: "لته (قهوه 50/50 عربیکا)",
        category: "coffee",
        price: 42000,
        price_premium: 52000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400",
        order_index: 6,
        is_available: true
      },
      {
        name: "موکا (قهوه 80/20 عربیکا)",
        category: "coffee",
        price: 48000,
        price_premium: 58000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400",
        order_index: 7,
        is_available: true
      },
      {
        name: "ماکیاتو (قهوه 50/50 عربیکا)",
        category: "coffee",
        price: 38000,
        price_premium: 48000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1514432320407-a09c9e4aef1d?w=400",
        order_index: 8,
        is_available: true
      },
      {
        name: "آیس لته (قهوه 80/20 عربیکا)",
        category: "coffee",
        price: 45000,
        price_premium: 55000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400",
        order_index: 9,
        is_available: true
      },
      {
        name: "زومار (قهوه 50/50 عربیکا)",
        category: "coffee",
        price: 50000,
        price_premium: 60000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1514432320407-a09c9e4aef1d?w=400",
        order_index: 10,
        is_available: true
      },
      {
        name: "خیارپلو (قهوه 80/20 عربیکا)",
        category: "coffee",
        price: 52000,
        price_premium: 62000,
        has_dual_pricing: true,
        image_url: "https://images.unsplash.com/photo-1514432320407-a09c9e4aef1d?w=400",
        order_index: 11,
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
      {
        name: "OREO",
        category: "shake",
        price: 68000,
        image_url: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400",
        order_index: 15,
        is_available: true
      },
      {
        name: "نوستالژِ",
        category: "shake",
        price: 55000,
        image_url: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400",
        order_index: 16,
        is_available: true
      },
      {
        name: "بری",
        category: "shake",
        price: 58000,
        image_url: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400",
        order_index: 17,
        is_available: true
      },
      {
        name: "شکلات",
        category: "shake",
        price: 62000,
        image_url: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400",
        order_index: 18,
        is_available: true
      },
      {
        name: "قهوه",
        category: "shake",
        price: 50000,
        image_url: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400",
        order_index: 19,
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
      {
        name: "فروزن لایت",
        category: "cold_bar",
        price: 35000,
        image_url: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400",
        order_index: 22,
        is_available: true
      },
      {
        name: "مانگوپشن",
        category: "cold_bar",
        price: 48000,
        image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
        order_index: 23,
        is_available: true
      },
      {
        name: "آب نبات",
        category: "cold_bar",
        price: 42000,
        image_url: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400",
        order_index: 24,
        is_available: true
      },
      {
        name: "موهیتو",
        category: "cold_bar",
        price: 50000,
        image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
        order_index: 25,
        is_available: true
      },
      {
        name: "ترش",
        category: "cold_bar",
        price: 38000,
        image_url: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400",
        order_index: 26,
        is_available: true
      },
      
      // Hot Bar Category - بار گرم
      {
        name: "هات چاکلت",
        category: "hot_bar",
        price: 55000,
        image_url: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400",
        order_index: 27,
        is_available: true
      },
      {
        name: "یونانی",
        category: "hot_bar",
        price: 45000,
        image_url: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400",
        order_index: 28,
        is_available: true
      },
      {
        name: "شیرشکلات",
        category: "hot_bar",
        price: 50000,
        image_url: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400",
        order_index: 29,
        is_available: true
      },
      {
        name: "شیرنسکافه",
        category: "hot_bar",
        price: 48000,
        image_url: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400",
        order_index: 30,
        is_available: true
      },
      {
        name: "شیرکاکائو",
        category: "hot_bar",
        price: 52000,
        image_url: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400",
        order_index: 31,
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
      {
        name: "ماسالا",
        category: "tea",
        price: 40000,
        image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
        order_index: 34,
        is_available: true
      },
      {
        name: "ماچا",
        category: "tea",
        price: 45000,
        image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
        order_index: 35,
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
      {
        name: "دبل چاکلت",
        category: "cake",
        price: 95000,
        image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
        order_index: 37,
        is_available: true
      },
      {
        name: "فرانسوی",
        category: "cake",
        price: 90000,
        image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
        order_index: 38,
        is_available: true
      },
      {
        name: "هویج",
        category: "cake",
        price: 75000,
        image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
        order_index: 39,
        is_available: true
      },
      {
        name: "پای سیب",
        category: "cake",
        price: 80000,
        image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
        order_index: 40,
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
      },
      {
        name: "سالاد سزار",
        category: "food",
        price: 85000,
        image_url: "https://images.unsplash.com/photo-1528735602786-469f3817357d?w=400",
        order_index: 43,
        is_available: true
      },
      {
        name: "سالاد ویژه رست",
        category: "food",
        price: 95000,
        image_url: "https://images.unsplash.com/photo-1528735602786-469f3817357d?w=400",
        order_index: 44,
        is_available: true
      },
      {
        name: "سالاد ماکارونی",
        category: "food",
        price: 70000,
        image_url: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400",
        order_index: 45,
        is_available: true
      },
      
      // Breakfast Category - صبحانه
      {
        name: "صبحانه ایرانی",
        category: "breakfast",
        price: 150000,
        image_url: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400",
        order_index: 46,
        is_available: true
      },
      {
        name: "املت",
        category: "breakfast",
        price: 75000,
        image_url: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400",
        order_index: 47,
        is_available: true
      },
      {
        name: "املت سوجوک",
        category: "breakfast",
        price: 95000,
        image_url: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400",
        order_index: 48,
        is_available: true
      },
      {
        name: "صبحانه انگلیسی",
        category: "breakfast",
        price: 180000,
        image_url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
        order_index: 49,
        is_available: true
      },
      {
        name: "خوراک عدسی",
        category: "breakfast",
        price: 65000,
        image_url: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400",
        order_index: 50,
        is_available: true
      },
      {
        name: "نیمرو",
        category: "breakfast",
        price: 60000,
        image_url: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400",
        order_index: 51,
        is_available: true
      }
    ];
    
    console.log(`Creating ${sampleItems.length} menu items...`);
    
    // Save all items at once
    await this.save(sampleItems);
    
    console.log("Menu force reseed completed successfully!");
    console.log("=== MenuItem.forceReseed() SUCCESS ===");
    return sampleItems;
  }
} 