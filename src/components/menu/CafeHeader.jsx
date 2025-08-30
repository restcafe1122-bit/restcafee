import React from "react";
import { MapPin, Instagram, Phone, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function CafeHeader({ cafeSettings }) {
  const defaultHero = "https://images.unsplash.com/photo-1511920183276-50c1b0a69ac7?q=80&w=1932&auto=format&fit=crop";
  const heroImageUrl = cafeSettings.hero_image_url || defaultHero;

  return (
    <div className="relative overflow-hidden h-[70vh] md:h-[80vh] flex items-center justify-center text-center">
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
        className="relative z-20 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Logo */}
          {cafeSettings.logo_url && (
            <motion.div 
              className="mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 120 }}
            >
              <img 
                src={cafeSettings.logo_url} 
                alt="لوگو کافه" 
                className="h-24 md:h-28 mx-auto rounded-full shadow-2xl ring-4 ring-white/20"
              />
            </motion.div>
          )}

          {/* Cafe Name */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 drop-shadow-xl tracking-tight">
            {cafeSettings.cafe_name || "کافه رست"}
          </h1>

          {/* Description */}
          {cafeSettings.description && (
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
              {cafeSettings.description}
            </p>
          )}

          {/* Contact Info */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            {cafeSettings.location && (
              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="w-5 h-5 text-teal-300" />
                <span>{cafeSettings.location}</span>
              </div>
            )}
            {cafeSettings.instagram_url && (
              <a
                href={cafeSettings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/90 hover:text-teal-300 transition-colors group"
              >
                <Instagram className="w-5 h-5 text-teal-300 group-hover:scale-110 transition-transform" />
                <span>اینستاگرام</span>
              </a>
            )}
            {cafeSettings.phone && (
              <a
                href={`tel:${cafeSettings.phone}`}
                className="flex items-center gap-2 text-white/90 hover:text-teal-300 transition-colors group"
              >
                <Phone className="w-5 h-5 text-teal-300 group-hover:scale-110 transition-transform" />
                <span>{cafeSettings.phone}</span>
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
