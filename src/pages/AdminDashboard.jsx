import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { MenuItem, CafeSettings } from "../entities";
import { authAPI } from "../services/api";
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
    checkAuthAndLoadData();
  }, [navigate]);

  const checkAuthAndLoadData = async () => {
    try {
      console.log("=== AdminDashboard.checkAuthAndLoadData() START ===");
      
      // Check if user is authenticated via API
      const isAuthenticated = await authAPI.verifyToken();
      
      if (!isAuthenticated) {
        console.log("User not authenticated, redirecting to login");
        navigate(createPageUrl("AdminLogin"));
        return;
      }
      
      console.log("User authenticated, loading data...");
      await loadData();
      
      console.log("=== AdminDashboard.checkAuthAndLoadData() SUCCESS ===");
    } catch (error) {
      console.error("=== AdminDashboard.checkAuthAndLoadData() ERROR ===");
      console.error("Error details:", error);
      // If token verification fails, redirect to login
      navigate(createPageUrl("AdminLogin"));
    }
  };

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

  const handleLogout = async () => {
    try {
      console.log("=== AdminDashboard.handleLogout() START ===");
      
      // Clear the auth token
      localStorage.removeItem('authToken');
      
      console.log("Logged out successfully");
      navigate(createPageUrl("Menu"));
      
      console.log("=== AdminDashboard.handleLogout() SUCCESS ===");
    } catch (error) {
      console.error("=== AdminDashboard.handleLogout() ERROR ===");
      console.error("Error details:", error);
      // Even if logout fails, redirect to menu
      navigate(createPageUrl("Menu"));
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
              <Coffee className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              پنل مدیریت کافه رست
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">مدیریت منو و تنظیمات کافه</p>
          </div>
          
                    <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <Button 
              onClick={loadData} 
              variant="outline"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              <span className="hidden sm:inline">بارگذاری مجدد</span>
              <span className="sm:hidden">بارگذاری</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl("Menu"))}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              <span className="hidden sm:inline">بازگشت به منو</span>
              <span className="sm:hidden">منو</span>
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              خروج
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <AdminStats menuItems={menuItems} />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
            <TabsTrigger value="menu" className="flex items-center gap-1 md:gap-2 text-sm md:text-base rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">
              <MenuIcon className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">مدیریت منو</span>
              <span className="sm:hidden">منو</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1 md:gap-2 text-sm md:text-base rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">
              <Store className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">تنظیمات کافه</span>
              <span className="sm:hidden">تنظیمات</span>
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
