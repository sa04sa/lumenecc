"use client";

import React from "react";
import { services } from "@/data";
import { AnimatedSection } from "../ui/AnimatedSection";
import { SectionHeading } from "../ui/SectionHeading";
import { Home, Building, Factory, Smartphone, Zap, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const iconMap: Record<string, React.ReactNode> = {
  Home: <Home className="w-7 h-7" />,
  Building: <Building className="w-7 h-7" />,
  Factory: <Factory className="w-7 h-7" />,
  Smartphone: <Smartphone className="w-7 h-7" />,
  Zap: <Zap className="w-7 h-7" />,
  AlertTriangle: <AlertTriangle className="w-7 h-7" />,
};

const frenchServices = [
  { id: 1, title: "Électricité Résidentielle", description: "Câblage complet, éclairage, mise à niveau du tableau et inspection de sécurité.", icon: "Home" },
  { id: 2, title: "Projets Commerciaux", description: "Aménagement bureaux, éclairage commercial, câblage data et maintenance préventive.", icon: "Building" },
  { id: 3, title: "Câblage Industriel", description: "Câblage machines lourdes, triphasé, commandes moteurs et éclairage d'usine.", icon: "Factory" },
  { id: 4, title: "Maison Connectée", description: "Éclairage intelligent, systèmes de sécurité, climatisation et home cinéma.", icon: "Smartphone" },
  { id: 5, title: "Solaire & Bornes EV", description: "Installation panneaux solaires, stockage batterie et bornes de recharge.", icon: "Zap" },
  { id: 6, title: "Urgences 24h/7j", description: "Interventions d'urgence 24/7 pour pannes, coupures et dangers électriques.", icon: "AlertTriangle" },
];

export function Services() {
  return (
    <AnimatedSection id="services" className="bg-[#0a0a0a] border-t border-[#FFB800]/10">
      <div className="container mx-auto px-4 md:px-8">
        <SectionHeading title="Nos Expertises" subtitle="Ce Que Nous Faisons" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#FFB800]/10">
          {frenchServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="bg-[#0a0a0a] p-8 group hover:bg-[#111111] transition-colors duration-300 relative overflow-hidden"
            >


              {/* Icon */}
              <div className="w-14 h-14 flex items-center justify-center text-[#FFB800] mb-6 border border-[#FFB800]/20 group-hover:border-[#FFB800] group-hover:bg-[#FFB800] group-hover:text-black transition-all duration-300">
                {iconMap[service.icon]}
              </div>

              {/* Number */}
              <span className="text-[#FFB800]/20 text-6xl font-black absolute top-4 right-6 leading-none group-hover:text-[#FFB800]/10 transition-colors">
                {String(index + 1).padStart(2, "0")}
              </span>

              <h3 className="text-lg font-black text-white uppercase tracking-wide mb-3">
                {service.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
