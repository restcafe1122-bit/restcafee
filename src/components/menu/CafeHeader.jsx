import React from "react";
import { MapPin, Instagram, Phone, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function CafeHeader({ cafeSettings }) {
  const defaultHero = "https://images.unsplash.com/photo-1511920183276-50c1b0a69ac7?q=80&w=1932&auto=format&fit=crop";
  const heroImageUrl = cafeSettings.hero_image_url || defaultHero;

  return (
    <div className="relative overflow-hidden h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] flex items-center justify-center text-center">
      {/* Hero Background Image */}
      <motion.div 
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <img src={heroImageUrl} alt="Cafe" className="w-full h-full object-cover"/>
      </motion.div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10"></div>

      <motion.div 
        className="relative z-20 px-3 sm:px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Logo */}
          {cafeSettings.logo_url && (
            <motion.div 
              className="mb-4 sm:mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 120 }}
            >
              <img 
                src={cafeSettings.logo_url} 
                alt="لوگو کافه" 
                className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 mx-auto rounded-full shadow-2xl ring-4 ring-white/20"
              />
            </motion.div>
          )}

          {/* Cafe Name */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white mb-3 sm:mb-4 drop-shadow-xl tracking-tight">
            {cafeSettings.cafe_name || "کافه رست"}
          </h1>

          {/* Description */}
          {cafeSettings.description && (
            <p className="text-white/80 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
              {cafeSettings.description}
            </p>
          )}

          {/* Contact Info */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 px-2">
            {cafeSettings.location && (
              <div className="flex items-center gap-2 text-white/90 text-sm sm:text-base">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-teal-300" />
                <span>{cafeSettings.location}</span>
              </div>
            )}
            {cafeSettings.instagram_url && (
              <a
                href={cafeSettings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/90 hover:text-teal-300 transition-colors group text-sm sm:text-base"
              >
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-teal-300 group-hover:scale-110 transition-transform" />
                <span>اینستاگرام</span>
              </a>
            )}
            {cafeSettings.phone && (
              <a
                href={`tel:${cafeSettings.phone}`}
                className="flex items-center gap-2 text-white/90 hover:text-teal-300 transition-colors group text-sm sm:text-base"
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-teal-300 group-hover:scale-110 transition-transform" />
                <span>{cafeSettings.phone}</span>
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
