import { storage } from '../utils';

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
    const settings = new CafeSettings(data);
    await this.save([settings]);
    return settings;
  }
  
  static async update(id, data) {
    const settings = await this.list();
    const index = settings.findIndex(s => s.id === id);
    if (index !== -1) {
      settings[index] = { ...settings[index], ...data, updated_at: new Date().toISOString() };
      await this.save(settings);
      return settings[index];
    }
    throw new Error('CafeSettings not found');
  }
  
  static async delete(id) {
    const settings = await this.list();
    const filtered = settings.filter(s => s.id !== id);
    await this.save(filtered);
  }
  
  static async list() {
    return storage.get(this.STORAGE_KEY, []);
  }
  
  static async getById(id) {
    const settings = await this.list();
    return settings.find(s => s.id === id);
  }
  
  static async getDefault() {
    const settings = await this.list();
    return settings[0] || new CafeSettings();
  }
  
  static async save(settings) {
    try {
      console.log("=== CafeSettings.save() START ===");
      console.log("Settings to save:", settings);
      
      if (!Array.isArray(settings)) {
        console.error("Settings is not an array:", settings);
        throw new Error("Settings must be an array");
      }
      
      // Validate settings
      const validatedSettings = settings.map((setting, index) => {
        if (!setting || typeof setting !== 'object') {
          console.error(`Invalid setting at index ${index}:`, setting);
          return null;
        }
        
        if (!setting.id) {
          console.warn("Setting missing ID:", setting);
          setting.id = 'default';
        }
        
        // Ensure all required fields exist
        const validatedSetting = {
          id: setting.id,
          cafe_name: setting.cafe_name || 'کافه رست',
          location: setting.location || 'اردبیل',
          logo_url: setting.logo_url || '',
          hero_image_url: setting.hero_image_url || '',
          instagram_url: setting.instagram_url || '',
          admin_username: setting.admin_username || 'admin',
          admin_password: setting.admin_password || 'rest2024',
          phone: setting.phone || '',
          description: setting.description || 'کافه رست - بهترین قهوه و شیک در اردبیل',
          created_at: setting.created_at || new Date().toISOString(),
          updated_at: setting.updated_at || new Date().toISOString()
        };
        
        console.log(`Validated setting ${index}:`, validatedSetting);
        return validatedSetting;
      }).filter(setting => setting !== null);
      
      console.log("Final validated settings:", validatedSettings);
      
      // Save to storage
      await storage.set(this.STORAGE_KEY, validatedSettings);
      
      // Verify the save was successful
      const savedSettings = await storage.get(this.STORAGE_KEY, []);
      if (savedSettings.length === validatedSettings.length) {
        console.log("Cafe settings saved and verified successfully");
        console.log("=== CafeSettings.save() SUCCESS ===");
      } else {
        console.error("Save verification failed - settings count mismatch");
        console.error("Expected:", validatedSettings.length, "Got:", savedSettings.length);
        throw new Error("Save verification failed");
      }
    } catch (error) {
      console.error("=== CafeSettings.save() ERROR ===");
      console.error("Error details:", error);
      throw error;
    }
  }
  
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
    
    const defaultSettings = new CafeSettings({
      cafe_name: "کافه رست",
      location: "اردبیل",
      description: "بهترین قهوه و شیک در اردبیل با کیفیت عالی و طعم بی‌نظیر",
      phone: "09123456789",
      instagram_url: "https://instagram.com/caferest",
      hero_image_url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
      logo_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200",
      admin_username: "admin",
      admin_password: "rest2024"
    });
    
    // Create new settings
    const created = await this.create(defaultSettings);
    console.log("CafeSettings seeding completed successfully!");
    console.log("=== CafeSettings.seed() SUCCESS ===");
    return created;
  }
} 