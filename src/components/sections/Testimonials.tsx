"use client";

import React from "react";
import { AnimatedSection } from "../ui/AnimatedSection";
import { SectionHeading } from "../ui/SectionHeading";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    id: 1,
    name: "Sarah Benali",
    role: "Propriétaire",
    text: "LUMENEC a complètement transformé notre maison avec leurs solutions d'éclairage intelligent. Professionnels, ponctuels et une attention au détail remarquable.",
    rating: 5,
  },
  {
    id: 2,
    name: "Karim Mansouri",
    role: "Directeur Technique",
    text: "Pour l'aménagement de nos bureaux, nous avions besoin d'un partenaire fiable. LUMENEC a livré notre infrastructure complexe avant le délai prévu.",
    rating: 5,
  },
  {
    id: 3,
    name: "Yacine Boudiaf",
    role: "Responsable Usine",
    text: "La mise à niveau triphasée s'est déroulée sans accroc. Temps d'arrêt minimal et les nouveaux systèmes de sécurité sont au top niveau.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <AnimatedSection id="testimonials" className="bg-[#0a0a0a] border-t border-[#FFB800]/10">
      <div className="container mx-auto px-4 md:px-8">
        <SectionHeading title="Ce Que Disent Nos Clients" subtitle="Témoignages" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#FFB800]/10">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-[#0a0a0a] p-8 relative group hover:bg-[#111] transition-colors duration-300"
            >
              {/* Top yellow accent line */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#FFB800] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

              <Quote className="w-8 h-8 text-[#FFB800]/30 mb-6" fill="currentColor" />

              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-[#FFB800]"
                    fill="#FFB800"
                  />
                ))}
              </div>

              <p className="text-gray-400 text-sm leading-relaxed mb-8 italic">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              <div className="flex items-center gap-4 border-t border-gray-900 pt-6">
                <div className="w-10 h-10 bg-[#FFB800] flex items-center justify-center font-black text-black text-sm">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-white text-sm uppercase tracking-wide">
                    {testimonial.name}
                  </h4>
                  <p className="text-[#FFB800] text-xs uppercase tracking-wider">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
