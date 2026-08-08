"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/Button";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Accueil", href: "#home" },
    { name: "Services", href: "#services" },
    { name: "Portfolio", href: "#portfolio" },
    { name: "Témoignages", href: "#testimonials" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-500",
        isScrolled
          ? "bg-black/95 backdrop-blur-md border-b border-[#FFB800]/20 py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <a href="#home" className="flex items-center">
          {/* PLACE VOTRE LOGO ICI / PLACE YOUR LOGO HERE */}
          {/* Mettez votre fichier logo (logo.png) dans le dossier public/ */}
          <img
            src="/logo.png"
            alt="LUMENEC Logo"
            className="h-24 w-auto object-contain"
          />
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="text-gray-400 hover:text-[#FFB800] font-semibold text-sm uppercase tracking-widest transition-colors duration-300 relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#FFB800] group-hover:w-full transition-all duration-300" />
                </a>
              </li>
            ))}
          </ul>
          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              document
                .getElementById("portfolio")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Devis Gratuit
          </Button>
          <a
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gray-500 hover:text-[#FFB800] border border-gray-700 hover:border-[#FFB800]/50 px-4 py-2 rounded-lg transition-all duration-300"
          >
            <Lock size={13} />
            Admin
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white p-2 border border-[#FFB800]/30 hover:border-[#FFB800] transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5 text-[#FFB800]" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black border-t border-[#FFB800]/30 shadow-2xl">
          <ul className="flex flex-col py-6 px-6 gap-1">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gray-400 hover:text-[#FFB800] font-semibold py-3 text-sm uppercase tracking-widest border-b border-gray-900 transition-colors"
                >
                  {link.name}
                </a>
              </li>
            ))}
            <li className="pt-4">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Devis Gratuit
              </Button>
            </li>
            <li>
              <a
                href="/admin/login"
                className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold uppercase tracking-widest text-gray-500 hover:text-[#FFB800] border border-gray-800 hover:border-[#FFB800]/40 rounded-lg transition-all duration-300"
              >
                <Lock size={14} />
                Connexion Admin
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
