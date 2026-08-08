"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, Package, Settings, LogOut,
  Plus, Globe, Menu, X, FileText, ClipboardList, Truck,
  Receipt, ChevronDown, ChevronRight, Zap
} from "lucide-react";

const docItems = [
  { href: "/admin/devis", icon: FileText, label: "Devis", color: "text-violet-400" },
  { href: "/admin/bons-commande", icon: ClipboardList, label: "Bons de Commande", color: "text-amber-400" },
  { href: "/admin/bons-livraison", icon: Truck, label: "Bons de Livraison", color: "text-emerald-400" },
  { href: "/admin/factures", icon: Receipt, label: "Factures", color: "text-blue-400" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(
    docItems.some(i => pathname.startsWith(i.href))
  );

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src="/logo.png" alt="LUMENEC" className="h-9 w-auto object-contain" />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-slate-950" />
          </div>
          <div>
            <p className="text-white font-extrabold text-sm tracking-wide leading-none">LUMENEC</p>
            <p className="text-yellow-400/70 text-[10px] uppercase tracking-[0.2em] leading-none mt-1">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <div className="px-4 pt-4 pb-2">
        <Link
          href="/admin/factures/nouvelle"
          onClick={() => setMobileOpen(false)}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-sm hover:from-yellow-300 hover:to-orange-400 transition-all duration-200 shadow-lg shadow-orange-500/25"
        >
          <Plus size={16} />
          Nouvelle Facture
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">

        {/* Dashboard */}
        <Link
          href="/admin"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group ${
            isActive("/admin")
              ? "bg-white/10 text-white"
              : "text-slate-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <LayoutDashboard size={16} className={isActive("/admin") ? "text-yellow-400" : "text-slate-500 group-hover:text-slate-300"} />
          Tableau de bord
          {isActive("/admin") && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />}
        </Link>

        {/* Separator */}
        <div className="px-3 pt-4 pb-1">
          <p className="text-slate-600 text-[10px] uppercase tracking-[0.2em] font-bold">Documents</p>
        </div>

        {/* Docs group — collapsible */}
        <button
          onClick={() => setDocsOpen(!docsOpen)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 w-full text-left group ${
            docItems.some(i => isActive(i.href))
              ? "bg-white/10 text-white"
              : "text-slate-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Zap size={16} className={docItems.some(i => isActive(i.href)) ? "text-yellow-400" : "text-slate-500 group-hover:text-slate-300"} />
          Workflow commercial
          <span className="ml-auto">
            {docsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        </button>

        {docsOpen && (
          <div className="ml-4 pl-3 border-l border-white/10 space-y-0.5 mt-0.5">
            {docItems.map(({ href, icon: Icon, label, color }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-sm transition-all duration-150 group ${
                  isActive(href)
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={15} className={isActive(href) ? color : "text-slate-600 group-hover:text-slate-400"} />
                {label}
                {isActive(href) && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />}
              </Link>
            ))}
          </div>
        )}

        {/* Separator */}
        <div className="px-3 pt-4 pb-1">
          <p className="text-slate-600 text-[10px] uppercase tracking-[0.2em] font-bold">Gestion</p>
        </div>

        {[
          { href: "/admin/clients", icon: Users, label: "Clients" },
          { href: "/admin/produits", icon: Package, label: "Produits" },
          { href: "/admin/parametres", icon: Settings, label: "Paramètres" },
        ].map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group ${
              isActive(href)
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon size={16} className={isActive(href) ? "text-yellow-400" : "text-slate-500 group-hover:text-slate-300"} />
            {label}
            {isActive(href) && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-xs font-black text-black flex-shrink-0">
            A
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">Administrateur</p>
            <p className="text-xs text-slate-500 truncate">LUMENEC Admin</p>
          </div>
        </div>
        <Link
          href="/"
          className="flex w-full items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-yellow-400 rounded-xl hover:bg-yellow-500/10 transition-all duration-150 text-sm font-medium"
        >
          <Globe size={15} />
          Voir le site
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-all duration-150 text-sm font-medium"
        >
          <LogOut size={15} />
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-64 min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex-col shadow-2xl border-r border-white/5 sticky top-0 h-screen overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-slate-950/95 backdrop-blur border-b border-white/5 shadow-lg">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="LUMENEC" className="h-8 w-auto object-contain" />
          <span className="text-xs text-yellow-400/80 font-bold uppercase tracking-widest">Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col shadow-2xl border-r border-white/5 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
        >
          <X size={18} />
        </button>
        <SidebarContent />
      </aside>
    </>
  );
}
