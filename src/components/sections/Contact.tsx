"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { AnimatedSection } from "../ui/AnimatedSection";
import { SectionHeading } from "../ui/SectionHeading";
import { Button } from "../ui/Button";
import { MapPin, Phone, Mail, Clock, Zap } from "lucide-react";

type FormData = {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
};

const contactInfo = [
  {
    icon: Phone,
    label: "Téléphone",
    lines: ["+212 690 040 036 (Urgences)", "+212 690 040 036 (Bureau)"],
    color: "#FFB800",
  },
  {
    icon: Mail,
    label: "Email",
    lines: ["contact@lumenec.dz", "support@lumenec.dz"],
    color: "#FFB800",
  },
  {
    icon: MapPin,
    label: "Adresse",
    lines: ["332 Bd Brahim Roufani, 5ème étage N21", "Résidence Rayhane, Maarif, Casablanca, Maroc"],
    color: "#FFB800",
  },
  {
    icon: Clock,
    label: "Horaires",
    lines: ["Lun–Sam: 8h – 18h", "Urgences: 24h/7j"],
    color: "#FFB800",
  },
];

export function Contact() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log(data);
    alert("Message envoyé avec succès !");
  };

  const inputClass =
    "w-full bg-black border border-gray-800 px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FFB800] transition-colors duration-300 placeholder-gray-700";

  return (
    <AnimatedSection id="contact" className="bg-black border-t border-[#FFB800]/10">
      <div className="container mx-auto px-4 md:px-8">
        <SectionHeading title="Contactez-Nous" subtitle="Commencer un Projet" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 border border-[#FFB800]/10">
          {/* Left panel - info */}
          <div className="lg:col-span-2 bg-[#0a0a0a] p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-[#FFB800]/10">
            {/* Yellow lightning accent */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-[#FFB800] flex items-center justify-center">
                <Zap className="w-5 h-5 text-black" fill="black" />
              </div>
              <div>
                <h3 className="text-white font-black uppercase text-sm tracking-widest">
                  Prêt à Démarrer ?
                </h3>
              </div>
            </div>

            <p className="text-gray-500 text-sm leading-relaxed mb-10">
              Que vous ayez besoin d&apos;une simple réparation, d&apos;un recâblage complet 
              ou d&apos;une installation domotique, notre équipe est disponible pour vous.
            </p>

            <div className="space-y-8">
              {contactInfo.map(({ icon: Icon, label, lines }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-10 h-10 border border-[#FFB800]/30 flex items-center justify-center text-[#FFB800] flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-xs uppercase tracking-widest mb-2">
                      {label}
                    </h4>
                    {lines.map((line) => (
                      <p key={line} className="text-gray-500 text-sm">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel - form */}
          <div className="lg:col-span-3 bg-[#0a0a0a] p-8 lg:p-12">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                    Nom Complet
                  </label>
                  <input
                    {...register("name", { required: "Le nom est requis" })}
                    type="text"
                    className={inputClass}
                    placeholder="Votre nom"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                    Email
                  </label>
                  <input
                    {...register("email", {
                      required: "L'email est requis",
                      pattern: { value: /^\S+@\S+$/i, message: "Email invalide" },
                    })}
                    type="email"
                    className={inputClass}
                    placeholder="votre@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                    Téléphone
                  </label>
                  <input
                    {...register("phone", { required: "Le téléphone est requis" })}
                    type="tel"
                    className={inputClass}
                    placeholder="+213 XX XX XX XX"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                    Type de Service
                  </label>
                  <select {...register("service")} className={`${inputClass} appearance-none`}>
                    <option value="residential">Résidentiel</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industriel</option>
                    <option value="emergency">Urgence</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                  Détails du Projet
                </label>
                <textarea
                  {...register("message", { required: "Le message est requis" })}
                  rows={5}
                  className={`${inputClass} resize-none`}
                  placeholder="Décrivez votre projet..."
                />
                {errors.message && (
                  <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Envoi en cours..." : "Envoyer le Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
