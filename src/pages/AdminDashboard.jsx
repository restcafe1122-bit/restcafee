import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { MenuItem, CafeSettings } from "../entities";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui";
import { Button } from "../components/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui";
import { ArrowRight, Coffee, Settings, Menu as MenuIcon, Store, RefreshCw, Trash2 } from "lucide-react";

import { MenuManagement, CafeSettingsManager, AdminStats } from "../components/admin";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cafeSettings, setCafeSettings] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [activeTab, setActiveTab] = useState("menu");

  useEffect(() => {
    // Check if admin is logged in
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate(createPageUrl("AdminLogin"));
      return;
    }

    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      console.log("=== AdminDashboard.loadData() START ===");
      
      // Only seed if no data exists
      console.log("Checking if data exists...");
      const existingItems = await MenuItem.list();
      const existingSettings = await CafeSettings.list();
      
      if (existingItems.length === 0) {
        console.log("No menu items found, seeding data...");
        try {
          await MenuItem.seed();
          console.log("MenuItem seeded successfully");
        } catch (error) {
          console.error("Error seeding MenuItem:", error);
        }
      } else {
        console.log("Menu items already exist, skipping seed");
      }
      
      if (existingSettings.length === 0) {
        console.log("No settings found, seeding data...");
        try {
          await CafeSettings.seed();
          console.log("CafeSettings seeded successfully");
        } catch (error) {
          console.error("Error seeding CafeSettings:", error);
        }
      } else {
        console.log("Settings already exist, skipping seed");
      }

      console.log("Loading data...");

      // Load data
      const [items, settings] = await Promise.all([
        MenuItem.list(),
        CafeSettings.list()
      ]);

      console.log("Loaded menu items:", items);
      console.log("Loaded cafe settings:", settings);

      // Ensure items is an array and sort them
      if (Array.isArray(items) && items.length > 0) {
        const sortedItems = items.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
        console.log("Sorted menu items:", sortedItems);
        setMenuItems(sortedItems);
        console.log("Menu items state set with", sortedItems.length, "items");
      } else {
        console.log("No menu items found, setting empty array");
        setMenuItems([]);
      }
      
      // Get the first settings or create default
      const firstSettings = settings[0];
      if (firstSettings) {
        console.log("Using existing settings:", firstSettings);
        setCafeSettings(firstSettings);
      } else {
        // Create default settings if none exist
        console.log("Creating default settings...");
        try {
          const defaultSettings = await CafeSettings.create({
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
          console.log("Created default settings:", defaultSettings);
          setCafeSettings(defaultSettings);
        } catch (error) {
          console.error("Error creating default settings:", error);
          // Set a basic settings object as fallback
          setCafeSettings({
            cafe_name: "کافه رست",
            location: "اردبیل",
            description: "بهترین قهوه و شیک در اردبیل",
            phone: "",
            instagram_url: "",
            logo_url: "",
            hero_image_url: "",
            admin_username: "admin",
            admin_password: "rest2024"
          });
        }
      }
      
      console.log("=== AdminDashboard.loadData() SUCCESS ===");
    } catch (error) {
      console.error("=== AdminDashboard.loadData() ERROR ===");
      console.error("Error details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh menu items specifically
  const refreshMenuItems = async () => {
    try {
      console.log("=== refreshMenuItems() START ===");
      const items = await MenuItem.list();
      console.log("Raw items from storage:", items);
      
      if (Array.isArray(items) && items.length > 0) {
        const sortedItems = items.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
        console.log("Sorted items:", sortedItems);
        setMenuItems(sortedItems);
        console.log("Menu items state updated with", sortedItems.length, "items");
      } else {
        console.log("No items found or invalid data, setting empty array");
        setMenuItems([]);
      }
      console.log("=== refreshMenuItems() SUCCESS ===");
    } catch (error) {
      console.error("=== refreshMenuItems() ERROR ===");
      console.error("Error details:", error);
      setMenuItems([]);
    }
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    if (value === "settings" && !cafeSettings) {
      // Force reload data if settings tab is selected but no settings exist
      loadData();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate(createPageUrl("Menu"));
  };

  const handleClearData = async () => {
    if (window.confirm("آیا مطمئن هستید که می‌خواهید همه داده‌ها را پاک کنید؟ این کار قابل بازگشت نیست.")) {
      try {
        console.log("Clearing all data...");
        
        // Clear localStorage data
        localStorage.removeItem('menuItems');
        localStorage.removeItem('cafeSettings');
        
        console.log("Data cleared, reloading...");
        
        // Reload data
        await loadData();
        
        alert("داده‌ها پاک شدند و مجدداً بارگذاری شدند.");
      } catch (error) {
        console.error("Error clearing data:", error);
        alert("خطا در پاک کردن داده‌ها");
      }
    }
  };

  const handleForceReseed = async () => {
    if (window.confirm("آیا مطمئن هستید که می‌خواهید منو را با نام‌های به‌روزرسانی شده بارگذاری مجدد کنید؟")) {
      try {
        console.log("Force reseeding menu items...");
        
        // Force reseed menu items with updated names
        await MenuItem.forceReseed();
        
        console.log("Menu items force reseeded, reloading...");
        
        // Reload data
        await loadData();
        
        alert("منو با نام‌های به‌روزرسانی شده بارگذاری شد.");
      } catch (error) {
        console.error("Error force reseeding:", error);
        alert("خطا در بارگذاری مجدد منو");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Coffee className="w-8 h-8 text-green-600" />
              پنل مدیریت کافه رست
            </h1>
            <p className="text-gray-600 mt-2">مدیریت منو و تنظیمات کافه</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={loadData} 
              variant="outline"
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              بارگذاری مجدد
            </Button>
            
            <Button
              onClick={handleForceReseed}
              variant="outline"
              className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              به‌روزرسانی نام‌ها
            </Button>
            
            <Button
              onClick={handleClearData}
              variant="outline"
              className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              پاک کردن داده‌ها
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl("Menu"))}
              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              بازگشت به منو
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              خروج
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <AdminStats menuItems={menuItems} />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <MenuIcon className="w-4 h-4" />
              مدیریت منو
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              تنظیمات کافه
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu">
            <MenuManagement 
              menuItems={menuItems} 
              setMenuItems={setMenuItems}
              onDataChange={refreshMenuItems}
            />
          </TabsContent>

          <TabsContent value="settings">
            {cafeSettings ? (
              <CafeSettingsManager 
                cafeSettings={cafeSettings}
                setCafeSettings={setCafeSettings}
                onDataChange={loadData}
              />
            ) : (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">در حال بارگذاری تنظیمات...</p>
                <button 
                  onClick={loadData}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  بارگذاری مجدد
                </button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
