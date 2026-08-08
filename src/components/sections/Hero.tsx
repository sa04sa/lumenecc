"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Phone, Zap } from "lucide-react";
import { Button } from "../ui/Button";

export function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Background Image with dark overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop"
          alt="Electrician at work"
          className="w-full h-full object-cover opacity-25"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/60" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Yellow lightning bolt diagonal accent (inspired by logo) */}
      <div className="absolute right-0 top-0 h-full w-1/2 overflow-hidden z-0 pointer-events-none">
        <div
          className="absolute right-[15%] top-0 bottom-0 w-[3px] opacity-20"
          style={{ background: "linear-gradient(to bottom, transparent, #FFB800, transparent)", transform: "rotate(15deg) scaleY(1.5)" }}
        />
        <div
          className="absolute right-[25%] top-0 bottom-0 w-[1px] opacity-10"
          style={{ background: "linear-gradient(to bottom, transparent, #FFB800, transparent)", transform: "rotate(15deg) scaleY(1.5)" }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,184,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,184,0,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container relative z-10 mx-auto px-4 md:px-8">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >


            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none mb-6 uppercase">
              L&apos;ÉCLAT DE{" "}
              <span className="text-[#FFB800] glow-yellow-text">
                L&apos;EXCELLENCE
              </span>
              <br />
              ÉLECTRIQUE
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed font-medium">
              Des solutions électriques sur mesure pour particuliers, entreprises et industries. 
              Expertise, sécurité et innovation au service de vos projets.
            </p>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-wrap gap-8 mb-10"
            >
              {[
                { value: "500+", label: "Projets Réalisés" },
                { value: "15+", label: "Ans d'Expérience" },
                { value: "100%", label: "Satisfaction Client" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="text-3xl font-black text-[#FFB800]">{stat.value}</span>
                  <span className="text-gray-500 text-xs uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="group"
                onClick={() =>
                  document
                    .getElementById("portfolio")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Demander un Devis
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <Phone className="w-5 h-5" />
                +212 690 040 036
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div className="w-[1px] h-16 bg-gradient-to-b from-[#FFB800] to-transparent animate-pulse" />
      </motion.div>
    </section>
  );
}
