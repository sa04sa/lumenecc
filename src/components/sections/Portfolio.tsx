"use client";

import React, { useState } from "react";
import { AnimatedSection } from "../ui/AnimatedSection";
import { SectionHeading } from "../ui/SectionHeading";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, ArrowRight } from "lucide-react";

const categories = ["Tout", "Villa", "Appartement", "Immeuble", "Commerce", "Bureau"];

const portfolioItems = [
  {
    id: 1,
    title: "Installation Complète — Villa R+1",
    category: "Villa",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop",
    description: "Installation électrique complète d'une villa R+1 : tableau général, circuits prise et éclairage, interphones et prises RJ45.",
    technologies: ["Tableau Schneider", "Câblage 2.5mm²", "Interphone"],
    location: "Maarif, Casablanca",
    duration: "12 Jours",
  },
  {
    id: 2,
    title: "Rénovation Électrique — Appartement 120m²",
    category: "Appartement",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=2074&auto=format&fit=crop",
    description: "Remplacement complet de l'ancienne installation, pose d'un nouveau tableau, mise aux normes et remplacement des prises.",
    technologies: ["Mise aux normes", "Tableau Legrand", "Prises 16A"],
    location: "Hay Hassani, Casablanca",
    duration: "5 Jours",
  },
  {
    id: 3,
    title: "Câblage Immeuble R+5 — 20 Appartements",
    category: "Immeuble",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=2070&auto=format&fit=crop",
    description: "Câblage électrique complet d'un immeuble de 20 appartements avec tableau de colonne, compteurs individuels et éclairage communs.",
    technologies: ["Colonnes Montantes", "Compteurs Individuels", "Éclairage Communs"],
    location: "Ain Sebaa, Casablanca",
    duration: "45 Jours",
  },
  {
    id: 4,
    title: "Installation Boutique — Local Commercial 80m²",
    category: "Commerce",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=2070&auto=format&fit=crop",
    description: "Installation électrique d'un local commercial : éclairage LED encastré, prises de courant, tableau et enseigne lumineuse.",
    technologies: ["Spots LED", "Prises 32A", "Enseigne"],
    location: "Derb Sultan, Casablanca",
    duration: "4 Jours",
  },
  {
    id: 5,
    title: "Câblage Bureau — Espace Open Space",
    category: "Bureau",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2070&auto=format&fit=crop",
    description: "Aménagement électrique d'un open space : câblage informatique, prises de bureau, éclairage fluorescent et climatisation.",
    technologies: ["Prises RJ45", "Éclairage Bureau", "Climatisation"],
    location: "CIL, Casablanca",
    duration: "6 Jours",
  },
  {
    id: 6,
    title: "Rénovation Villa — Mise aux Normes",
    category: "Villa",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070&auto=format&fit=crop",
    description: "Rénovation complète de l'installation électrique d'une villa ancienne : remplacement du tableau, des fils et des prises dans toutes les pièces.",
    technologies: ["Remplacement Tableau", "Fils 1.5 & 2.5mm²", "Disjoncteurs"],
    location: "Ain Diab, Casablanca",
    duration: "8 Jours",
  },
];

const categoryMap: Record<string, string> = {
  "Tout": "All",
  "Villa": "Villa",
  "Appartement": "Appartement",
  "Immeuble": "Immeuble",
  "Commerce": "Commerce",
  "Bureau": "Bureau",
};

export function Portfolio() {
  const [activeCategory, setActiveCategory] = useState("Tout");

  const filteredPortfolio =
    activeCategory === "Tout"
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === categoryMap[activeCategory]);

  return (
    <AnimatedSection id="portfolio" className="bg-black border-t border-[#FFB800]/10">
      <div className="container mx-auto px-4 md:px-8">
        <SectionHeading title="Projets Réalisés" subtitle="Notre Portfolio" />

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-14">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${
                activeCategory === category
                  ? "bg-[#FFB800] text-black border-[#FFB800] shadow-[0_0_20px_rgba(255,184,0,0.4)]"
                  : "bg-transparent text-gray-500 border-gray-800 hover:border-[#FFB800]/40 hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#FFB800]/10"
        >
          <AnimatePresence>
            {filteredPortfolio.map((item, index) => (
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                key={item.id}
                className="group relative overflow-hidden bg-black cursor-pointer"
              >
                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-90"
                    loading="lazy"
                  />
                </div>

                {/* Always visible bottom info bar */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                  <span className="text-[#FFB800] text-[10px] font-black uppercase tracking-[0.2em]">
                    {item.category}
                  </span>
                  <h3 className="text-white font-black text-sm uppercase mt-1 leading-tight">
                    {item.title}
                  </h3>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/90 flex flex-col justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                  <span className="text-[#FFB800] text-[10px] font-black uppercase tracking-[0.3em] mb-3">
                    {item.category}
                  </span>
                  <h3 className="text-xl font-black text-white uppercase mb-3 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] font-bold uppercase tracking-wider text-black bg-[#FFB800] px-2 py-1"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-gray-500 border-t border-gray-800 pt-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#FFB800]" />
                      {item.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#FFB800]" />
                      {item.duration}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* CTA */}
        <div className="text-center mt-14">
          <button className="inline-flex items-center gap-2 text-[#FFB800] font-black uppercase text-sm tracking-widest border-b-2 border-[#FFB800] pb-1 hover:gap-4 transition-all duration-300">
            Voir Tous les Projets <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </AnimatedSection>
  );
}
