import { menuAPI } from '../services/api';

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
      
      // Prepare data for API
      const itemData = {
        name: data.name.trim(),
        category: data.category || 'coffee',
        price: parseInt(data.price) || 0,
        price_premium: data.has_dual_pricing ? (parseInt(data.price_premium) || 0) : null,
        has_dual_pricing: data.has_dual_pricing || false,
        image_url: data.image_url || '',
        order_index: data.order_index || 0,
        is_available: data.is_available !== undefined ? data.is_available : true
      };
      
      console.log("Prepared data for API:", itemData);
      
      // Create via API
      const newItem = await menuAPI.create(itemData);
      console.log("Item created via API:", newItem);
      
      console.log("=== MenuItem.create() SUCCESS ===");
      return newItem;
    } catch (error) {
      console.error("=== MenuItem.create() ERROR ===");
      console.error("Error details:", error);
      throw error;
    }
  }
  
  static async update(id, data) {
    try {
      console.log("=== MenuItem.update() START ===");
      console.log("ID:", id, "Data:", data);
      
      const updatedItem = await menuAPI.update(id, data);
      console.log("Item updated via API:", updatedItem);
      
      console.log("=== MenuItem.update() SUCCESS ===");
      return updatedItem;
    } catch (error) {
      console.error("=== MenuItem.update() ERROR ===");
      console.error("Error details:", error);
      throw error;
    }
  }
  
  static async delete(id) {
    try {
      console.log("=== MenuItem.delete() START ===");
      console.log("ID:", id);
      
      await menuAPI.delete(id);
      console.log("Item deleted via API");
      
      console.log("=== MenuItem.delete() SUCCESS ===");
    } catch (error) {
      console.error("=== MenuItem.delete() ERROR ===");
      console.error("Error details:", error);
      throw error;
    }
  }
  
  static async list() {
    try {
      console.log("=== MenuItem.list() START ===");
      
      const items = await menuAPI.getAll();
      console.log("Items fetched from API:", items);
      
      console.log("=== MenuItem.list() SUCCESS ===");
      return items;
    } catch (error) {
      console.error("=== MenuItem.list() ERROR ===");
      console.error("Error details:", error);
      // Fallback to empty array if API fails
      return [];
    }
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
  
  // Note: save method removed - data persistence is now handled by the API
  
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
    console.log("Note: Seeding is now handled by the server database initialization");
    console.log("=== MenuItem.seed() DELEGATED TO SERVER ===");
    return [];
  }


} 