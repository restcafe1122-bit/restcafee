import { settingsAPI } from '../services/api';

export class CafeSettings {
  static STORAGE_KEY = 'cafeSettings';
  
  constructor(data = {}) {
    this.id = data.id || 'default';
    this.cafe_name = data.cafe_name || 'کافه رست';
    this.location = data.location || 'اردبیل';
    this.logo_url = data.logo_url || '';
    this.hero_image_url = data.hero_image_url || '';
    this.instagram_url = data.instagram_url || '';
    this.admin_username = data.admin_username || 'admin';
    this.admin_password = data.admin_password || 'rest2024';
    this.phone = data.phone || '';
    this.description = data.description || 'کافه رست - بهترین قهوه و شیک در اردبیل';
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }
  
  static async create(data) {
    try {
      console.log("=== CafeSettings.create() START ===");
      console.log("Input data:", data);
      
      const newSettings = await settingsAPI.create(data);
      console.log("Settings created via API:", newSettings);
      
      console.log("=== CafeSettings.create() SUCCESS ===");
      return newSettings;
    } catch (error) {
      console.error("=== CafeSettings.create() ERROR ===");
      console.error("Error details:", error);
      throw error;
    }
  }
  
  static async update(id, data) {
    try {
      console.log("=== CafeSettings.update() START ===");
      console.log("ID:", id, "Data:", data);
      
      const updatedSettings = await settingsAPI.update(id, data);
      console.log("Settings updated via API:", updatedSettings);
      
      console.log("=== CafeSettings.update() SUCCESS ===");
      return updatedSettings;
    } catch (error) {
      console.error("=== CafeSettings.update() ERROR ===");
      console.error("Error details:", error);
      throw error;
    }
  }
  
  static async delete(id) {
    try {
      console.log("=== CafeSettings.delete() START ===");
      console.log("ID:", id);
      
      await settingsAPI.delete(id);
      console.log("Settings deleted via API");
      
      console.log("=== CafeSettings.delete() SUCCESS ===");
    } catch (error) {
      console.error("=== CafeSettings.delete() ERROR ===");
      console.error("Error details:", error);
      throw error;
    }
  }
  
  static async list() {
    try {
      console.log("=== CafeSettings.list() START ===");
      
      const settings = await settingsAPI.getAll();
      console.log("Settings fetched from API:", settings);
      
      console.log("=== CafeSettings.list() SUCCESS ===");
      return settings;
    } catch (error) {
      console.error("=== CafeSettings.list() ERROR ===");
      console.error("Error details:", error);
      // Fallback to empty array if API fails
      return [];
    }
  }
  
  static async getById(id) {
    const settings = await this.list();
    return settings.find(s => s.id === id);
  }
  
  static async getDefault() {
    try {
      const settings = await this.list();
      return settings[0] || new CafeSettings();
    } catch (error) {
      console.error("Error getting default settings:", error);
      return new CafeSettings();
    }
  }
  
  // Note: save method removed - data persistence is now handled by the API
  
  static async seed() {
    console.log("=== CafeSettings.seed() START ===");
    const existing = await this.list();
    console.log("Existing settings count:", existing.length);
    
    // Only seed if no data exists
    if (existing.length > 0) {
      console.log("Settings already exist, skipping seed");
      console.log("=== CafeSettings.seed() SKIPPED ===");
      return existing[0];
    }
    
    console.log("No settings found, seeding new data...");
    console.log("Note: Seeding is now handled by the server database initialization");
    console.log("=== CafeSettings.seed() DELEGATED TO SERVER ===");
    return new CafeSettings();
  }
} 