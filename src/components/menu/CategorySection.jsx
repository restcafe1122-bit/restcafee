import React from "react";
import { Card, CardHeader, CardTitle } from "../ui";
import MenuItemCard from "./MenuItemCard";
import { motion } from "framer-motion";

export default function CategorySection({ category, items, formatPrice }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  // Ensure formatPrice is available
  const safeFormatPrice = formatPrice || ((price) => {
    if (!price && price !== 0) return "0";
    return new Intl.NumberFormat('fa-IR').format(price);
  });
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Category Header */}
      <div className="mb-6 md:mb-8 flex items-center gap-3 md:gap-4">
        <span className={`text-3xl md:text-4xl p-2 md:p-3 rounded-2xl bg-gradient-to-br ${category.color}`}>{category.emoji}</span>
        <div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">{category.name}</h2>
          <p className="text-gray-400 text-sm md:text-base">{items.length} مورد</p>
          {category.id === "coffee" && (
            <div className="mt-2 text-xs md:text-sm text-teal-300">
              ☕ قهوه‌های عربیکا با دو نوع قیمت (عادی و پریمیوم)
            </div>
          )}
        </div>
      </div>

      {/* Items Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
      >
        {items.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            formatPrice={safeFormatPrice}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
