import React from "react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-[#FFB800]/20">
      {/* Top section */}
      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="#home" className="inline-block mb-6">
              {/* PLACE VOTRE LOGO ICI / PLACE YOUR LOGO HERE */}
              {/* Mettez votre fichier logo.png dans le dossier public/ */}
              <img
                src="/logo.png"
                alt="LUMENEC Logo"
                className="h-24 w-auto object-contain"
              />
            </a>
            <p className="text-gray-600 text-sm leading-relaxed mb-5">
              Des solutions électriques premium avec une précision, sécurité et fiabilité inégalées. 
              Votre partenaire de confiance pour tous vos besoins en énergie.
            </p>
            {/* Adresse */}
            <div className="flex items-start gap-3 mb-6 p-4 border border-[#FFB800]/15 bg-[#FFB800]/5">
              <svg className="w-4 h-4 text-[#FFB800] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <div>
                <p className="text-[#FFB800] text-xs font-black uppercase tracking-widest mb-1">Notre Adresse</p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  332 Bd Brahim Roudani, 5ème étage N21<br />
                  Résidence Rayhane, Maarif<br />
                  Casablanca, Maroc
                </p>
              </div>
            </div>

          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
              <span className="w-4 h-[2px] bg-[#FFB800] inline-block" />
              Liens Rapides
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Accueil", href: "#home" },
                { label: "Services", href: "#services" },
                { label: "Portfolio", href: "#portfolio" },
                { label: "Témoignages", href: "#testimonials" },
                { label: "Contact", href: "#contact" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-[#FFB800] text-sm transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-[1px] bg-[#FFB800] group-hover:w-3 transition-all duration-300 inline-block" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
              <span className="w-4 h-[2px] bg-[#FFB800] inline-block" />
              Nos Services
            </h4>
            <ul className="space-y-3">
              {[
                "Câblage Résidentiel",
                "Aménagement Commercial",
                "Puissance Industrielle",
                "Domotique",
                "Solaire & EV",
              ].map((service) => (
                <li key={service} className="text-gray-600 text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-[#FFB800]/40 inline-block flex-shrink-0" />
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
              <span className="w-4 h-[2px] bg-[#FFB800] inline-block" />
              Newsletter
            </h4>
            <p className="text-gray-600 text-sm mb-5 leading-relaxed">
              Restez informé de nos dernières réalisations et offres exclusives.
            </p>
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="votre@email.com"
                className="bg-[#0a0a0a] border border-gray-800 px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FFB800] transition-colors duration-300 placeholder-gray-700"
              />
              <button
                type="button"
                className="bg-[#FFB800] text-black font-black uppercase tracking-widest text-xs px-4 py-3 hover:bg-[#FFD166] transition-colors duration-300"
              >
                S&apos;abonner
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#FFB800]/10">
        <div className="container mx-auto px-4 md:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-gray-700 text-xs uppercase tracking-wider">
            &copy; {year} LUMENEC. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
