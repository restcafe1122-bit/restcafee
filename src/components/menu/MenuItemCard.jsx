
import React from "react";
import { Card, CardContent } from "../ui";
import { Badge } from "../ui";
import { Star, Coffee } from "lucide-react";
import { motion } from "framer-motion";
import { getImageFromStorage } from "../../utils";

export default function MenuItemCard({ item, formatPrice }) {
  // Ensure formatPrice is available
  const safeFormatPrice = formatPrice || ((price) => {
    if (!price && price !== 0) return "0";
    return new Intl.NumberFormat('fa-IR').format(price);
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={cardVariants}>
      <Card className="group hover-lift overflow-hidden border border-gray-800 bg-gray-800/50 shadow-lg hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300 h-full flex flex-col">
        {/* Image */}
        <div className="relative h-40 md:h-48 lg:h-56 overflow-hidden">
          <img
            src={getImageFromStorage(item.image_url)}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.target.src = "/sample-coffee.jpg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          <div className="absolute bottom-3 md:bottom-4 right-3 md:right-4">
            <h3 className="font-bold text-lg md:text-xl text-white drop-shadow-md">
              {item.name}
            </h3>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-3 md:p-4 lg:p-5 flex-grow flex flex-col justify-between">
          <div>
            {/* Pricing */}
            <div className="space-y-2 mb-3 md:mb-4">
              {item.has_dual_pricing ? (
                <div className="space-y-2 md:space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs md:text-sm text-gray-400">لاین 50-50</span>
                    <span className="font-bold text-base md:text-lg text-teal-300">
                      {safeFormatPrice(item.price)} تومان
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs md:text-sm text-gray-400">80-20 عربیکا</span>
                    <span className="font-bold text-base md:text-lg text-teal-300">
                      {safeFormatPrice(item.price_premium || item.price)} تومان
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-baseline">
                  <span className="text-xl md:text-2xl lg:text-3xl font-bold text-teal-300">
                    {safeFormatPrice(item.price)} تومان
                  </span>
                  <span className="text-gray-400 text-sm md:text-base">تومان</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center text-amber-400 mt-2">
            <div className="flex items-center gap-1">
              {Array(5).fill(0).map((_, i) => (
                <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-current" />
              ))}
            </div>
            <Badge className="bg-gray-700 text-gray-300 border-gray-600 text-xs md:text-sm">
              {getCategoryName(item.category)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function getCategoryName(category) {
  const names = {
    coffee: "قهوه",
    shake: "شیک", 
    cold_bar: "بار سرد",
    hot_bar: "بار گرم",
    tea: "چای",
    cake: "کیک",
    food: "غذا",
    breakfast: "صبحانه"
  };
  return names[category] || category;
}

