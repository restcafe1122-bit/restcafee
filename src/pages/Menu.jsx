
import React, { useState, useEffect } from "react";
import { MenuItem, CafeSettings } from "../entities";
import { Link } from "react-router-dom";
import { createPageUrl, formatPrice } from "../utils";
import { Coffee, MapPin, Instagram, Phone, Settings, Star } from "lucide-react";
import { Card, CardContent } from "../components/ui";
import { Badge } from "../components/ui";
import { Button } from "../components/ui";
import { motion, AnimatePresence } from "framer-motion";

import { MenuItemCard, CategorySection, CafeHeader } from "../components/menu";

const categories = [
  { id: "coffee", name: "قهوه", emoji: "☕", color: "from-amber-400 to-orange-500" },
  { id: "shake", name: "شیک", emoji: "🥤", color: "from-pink-400 to-rose-500" },
  { id: "cold_bar", name: "بار سرد", emoji: "🧊", color: "from-sky-400 to-blue-500" },
  { id: "hot_bar", name: "بار گرم", emoji: "🔥", color: "from-red-500 to-orange-500" },
  { id: "tea", name: "چای", emoji: "🍃", color: "from-lime-400 to-green-500" },
  { id: "cake", name: "کیک", emoji: "🍰", color: "from-fuchsia-500 to-pink-600" },
  { id: "food", name: "غذا", emoji: "🍽️", color: "from-indigo-400 to-purple-500" },
  { id: "breakfast", name: "صبحانه", emoji: "🌅", color: "from-yellow-400 to-amber-500" }
];

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [cafeSettings, setCafeSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log("=== Menu.loadData() START ===");
      
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
      
      // Load all items first
      const allItems = await MenuItem.list();
      console.log("All items loaded:", allItems);
      
      // Filter available items
      const availableItems = allItems.filter(item => item.is_available !== false);
      console.log("Available items:", availableItems);
      
      // Sort by order_index
      const sortedItems = availableItems.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
      console.log("Sorted items:", sortedItems);
      
      const settings = await CafeSettings.list();
      
      console.log("Menu loaded with items:", sortedItems.length);
      console.log("Available categories:", [...new Set(sortedItems.map(item => item.category))]);
      console.log("Coffee items:", sortedItems.filter(item => item.category === "coffee").length);
      console.log("First few items:", sortedItems.slice(0, 5));
      
      setMenuItems(sortedItems);
      setCafeSettings(settings[0] || {
        cafe_name: "کافه رست",
        location: "اردبیل"
      });
      
      console.log("=== Menu.loadData() SUCCESS ===");
    } catch (error) {
      console.error("=== Menu.loadData() ERROR ===");
      console.error("Error details:", error);
    }
    setLoading(false);
  };

  const filteredItems = selectedCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <CafeHeader cafeSettings={cafeSettings} />

      {/* Category Filter */}
      <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-700 px-2 py-3 md:px-4 md:py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className={`whitespace-nowrap rounded-full px-3 md:px-4 text-sm md:text-base ${selectedCategory === "all" 
                ? "bg-teal-400 hover:bg-teal-500 text-gray-900 font-bold" 
                : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"}`}
            >
              همه موارد
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap rounded-full px-3 md:px-4 text-sm md:text-base flex items-center gap-1 md:gap-2 ${selectedCategory === category.id 
                  ? "bg-teal-400 hover:bg-teal-500 text-gray-900 font-bold" 
                  : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"}`}
              >
                <span className="text-sm md:text-base">{category.emoji}</span>
                <span className="hidden sm:inline">{category.name}</span>
                <span className="sm:hidden">{category.name.length > 3 ? category.name.substring(0, 3) : category.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-7xl mx-auto px-2 py-4 md:px-6 md:py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {Array(12).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : selectedCategory === "all" ? (
          <div className="space-y-12 md:space-y-16">
            {categories.map((category) => {
              const categoryItems = menuItems.filter(item => item.category === category.id);
              if (categoryItems.length === 0) return null;
              
              return (
                <CategorySection
                  key={category.id}
                  category={category}
                  items={categoryItems}
                  formatPrice={formatPrice}
                />
              );
            })}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
          >
            <AnimatePresence>
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  formatPrice={formatPrice}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-12 md:py-16">
            <Coffee className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">موردی یافت نشد</h3>
            <p className="text-gray-500">در این دسته‌بندی آیتمی موجود نیست</p>
          </div>
        )}
      </div>

    </div>
  );
}

