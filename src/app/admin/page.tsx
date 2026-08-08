import { getFactures, getClients, getProduits, getDocuments } from "./actions";
import Link from "next/link";
import {
  TrendingUp, FileText, Users, Package,
  ArrowUpRight, ClipboardList, Truck, Receipt,
  ChevronRight, Plus, AlertCircle, CheckCircle2, Clock
} from "lucide-react";

export default async function AdminDashboard() {
  const [allFactures, clients, produits, devis, bonsCommande, bonsLivraison] = await Promise.all([
    getFactures() as Promise<any[]>,
    getClients() as Promise<any[]>,
    getProduits() as Promise<any[]>,
    getDocuments('devis') as Promise<any[]>,
    getDocuments('bon_commande') as Promise<any[]>,
    getDocuments('bon_livraison') as Promise<any[]>,
  ]);

  const factures = allFactures.filter((f: any) => f.statut === 'validee');
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const caTotal = factures.reduce((s: number, f: any) => s + Number(f.total_ttc), 0);
  const caMois = factures
    .filter((f: any) => {
      const d = new Date(f.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((s: number, f: any) => s + Number(f.total_ttc), 0);

  const lastMonth = new Date(currentYear, currentMonth - 1, 1);
  const caDernierMois = factures
    .filter((f: any) => {
      const d = new Date(f.date);
      return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
    })
    .reduce((s: number, f: any) => s + Number(f.total_ttc), 0);

  const growthPct = caDernierMois > 0
    ? (((caMois - caDernierMois) / caDernierMois) * 100).toFixed(1)
    : null;

  const devisEnAttente = devis.filter((d: any) => d.statut === 'brouillon').length;
  const bcValidee = bonsCommande.filter((b: any) => b.statut === 'validee').length;
  const blValidee = bonsLivraison.filter((b: any) => b.statut === 'validee').length;

  // Recent activity: merge all docs, sort by created_at, take last 6
  const allDocs = [
    ...factures.slice(0, 3).map((f: any) => ({ ...f, _type: 'facture', _label: 'Facture', _color: 'bg-blue-100 text-blue-600' })),
    ...devis.slice(0, 2).map((d: any) => ({ ...d, _type: 'devis', _label: 'Devis', _color: 'bg-violet-100 text-violet-600' })),
    ...bonsCommande.slice(0, 2).map((b: any) => ({ ...b, _type: 'bon_commande', _label: 'BC', _color: 'bg-amber-100 text-amber-700' })),
    ...bonsLivraison.slice(0, 2).map((b: any) => ({ ...b, _type: 'bon_livraison', _label: 'BL', _color: 'bg-emerald-100 text-emerald-700' })),
  ].sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime()).slice(0, 7);

  const docHref = (doc: any) => {
    const map: Record<string, string> = {
      facture: '/admin/factures',
      devis: '/admin/devis',
      bon_commande: '/admin/bons-commande',
      bon_livraison: '/admin/bons-livraison',
    };
    return `${map[doc._type]}/${doc.id}`;
  };

  return (
    <div className="space-y-8 pb-10">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-2xl">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-yellow-400/80 text-xs font-bold uppercase tracking-[0.2em] mb-2">
              {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight mb-1">Tableau de bord</h1>
            <p className="text-slate-400 text-sm">Vue globale de votre activité commerciale LUMENEC</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/devis/nouveau"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all backdrop-blur-sm"
            >
              <Plus size={16} /> Devis
            </Link>
            <Link
              href="/admin/factures/nouvelle"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/30 transition-all"
            >
              <Plus size={16} /> Facture
            </Link>
          </div>
        </div>

        {/* CA Hero metric */}
        <div className="relative z-10 mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="sm:col-span-1">
            <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-1">CA Total TTC</p>
            <p className="text-4xl font-black text-white">
              {caTotal.toLocaleString('fr-MA', { minimumFractionDigits: 2 })}
              <span className="text-lg font-semibold text-yellow-400 ml-2">MAD</span>
            </p>
            {growthPct !== null && (
              <p className={`text-sm mt-1 flex items-center gap-1 font-semibold ${Number(growthPct) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                <TrendingUp size={14} />
                {Number(growthPct) >= 0 ? '+' : ''}{growthPct}% vs mois dernier
              </p>
            )}
          </div>
          <div className="sm:col-span-1 border-l border-white/10 pl-6">
            <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-1">Ce mois</p>
            <p className="text-3xl font-black text-white">
              {caMois.toLocaleString('fr-MA', { minimumFractionDigits: 2 })}
              <span className="text-sm font-medium text-slate-300 ml-2">MAD</span>
            </p>
            <p className="text-slate-400 text-sm mt-1">{factures.filter((f: any) => {
              const d = new Date(f.date);
              return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            }).length} factures émises</p>
          </div>
          <div className="sm:col-span-1 border-l border-white/10 pl-6">
            <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-1">Mois précédent</p>
            <p className="text-3xl font-black text-slate-300">
              {caDernierMois.toLocaleString('fr-MA', { minimumFractionDigits: 2 })}
              <span className="text-sm font-medium text-slate-400 ml-2">MAD</span>
            </p>
            <p className="text-slate-500 text-sm mt-1">{lastMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* ── 4 KPI Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Factures validées",
            value: factures.length,
            sub: `${allFactures.filter((f:any) => f.statut === 'brouillon').length} brouillons`,
            icon: Receipt,
            href: "/admin/factures",
            bg: "bg-blue-50",
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            badge: null,
          },
          {
            label: "Devis",
            value: devis.length,
            sub: `${devisEnAttente} en attente`,
            icon: FileText,
            href: "/admin/devis",
            bg: "bg-violet-50",
            iconBg: "bg-violet-100",
            iconColor: "text-violet-600",
            badge: devisEnAttente > 0 ? devisEnAttente : null,
          },
          {
            label: "Bons de Commande",
            value: bonsCommande.length,
            sub: `${bcValidee} validés`,
            icon: ClipboardList,
            href: "/admin/bons-commande",
            bg: "bg-amber-50",
            iconBg: "bg-amber-100",
            iconColor: "text-amber-600",
            badge: null,
          },
          {
            label: "Bons de Livraison",
            value: bonsLivraison.length,
            sub: `${blValidee} livrés`,
            icon: Truck,
            href: "/admin/bons-livraison",
            bg: "bg-emerald-50",
            iconBg: "bg-emerald-100",
            iconColor: "text-emerald-700",
            badge: null,
          },
        ].map(({ label, value, sub, icon: Icon, href, bg, iconBg, iconColor, badge }) => (
          <Link
            key={label}
            href={href}
            className={`group relative ${bg} rounded-2xl p-5 border border-black/5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
          >
            {badge !== null && (
              <span className="absolute top-4 right-4 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {badge}
              </span>
            )}
            <div className={`${iconBg} ${iconColor} w-11 h-11 rounded-xl flex items-center justify-center mb-4`}>
              <Icon size={20} />
            </div>
            <p className="text-3xl font-black text-slate-900">{value}</p>
            <p className="text-sm font-semibold text-slate-700 mt-0.5">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            <ArrowUpRight size={14} className="absolute bottom-4 right-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </Link>
        ))}
      </div>

      {/* ── Bottom Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Activité récente */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Activité récente</h2>
              <p className="text-slate-400 text-xs mt-0.5">Tous documents confondus</p>
            </div>
            <Link href="/admin/factures" className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
              Voir tout <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {allDocs.length === 0 && (
              <div className="py-16 text-center">
                <FileText size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Aucun document pour le moment</p>
                <Link href="/admin/factures/nouvelle" className="mt-3 inline-block text-sm text-blue-600 font-medium hover:underline">
                  Créer le premier →
                </Link>
              </div>
            )}
            {allDocs.map((doc: any) => (
              <Link key={`${doc._type}-${doc.id}`} href={docHref(doc)}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group">
                <div className={`${doc._color} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs`}>
                  {doc._label}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800 text-sm font-mono">{doc.numero}</p>
                    {doc.statut === 'validee' ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
                        <CheckCircle2 size={9} /> VALIDÉ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full">
                        <Clock size={9} /> BROUILLON
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs truncate">{doc.client_nom}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-slate-800 text-sm">{Number(doc.total_ttc).toFixed(2)} <span className="text-slate-400 font-normal">MAD</span></p>
                  <p className="text-slate-400 text-xs">{new Date(doc.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Panel droit */}
        <div className="flex flex-col gap-5">

          {/* Clients */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base">Clients</h2>
              <Link href="/admin/clients" className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
                Voir tout <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {clients.length === 0 && (
                <div className="py-8 text-center">
                  <Users size={32} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs">Aucun client</p>
                </div>
              )}
              {clients.slice(0, 5).map((c: any) => (
                <div key={c.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
                    {c.nom?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{c.nom}</p>
                    <p className="text-slate-400 text-xs truncate">{c.email || c.telephone || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
            {clients.length > 5 && (
              <div className="px-5 py-3 border-t border-slate-50">
                <Link href="/admin/clients" className="text-xs text-slate-400 hover:text-blue-600 transition-colors">
                  +{clients.length - 5} autres clients →
                </Link>
              </div>
            )}
          </div>

          {/* Workflow rapide */}
          <div className="bg-gradient-to-br from-slate-950 to-slate-800 rounded-2xl p-5 text-white shadow-xl">
            <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-3">Créer un document</p>
            <div className="space-y-2">
              {[
                { label: "Nouveau Devis", href: "/admin/devis/nouveau", icon: FileText },
                { label: "Bon de Commande", href: "/admin/bons-commande/nouveau", icon: ClipboardList },
                { label: "Bon de Livraison", href: "/admin/bons-livraison/nouveau", icon: Truck },
                { label: "Facture", href: "/admin/factures/nouvelle", icon: Receipt },
              ].map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all group text-sm font-medium">
                  <Icon size={15} className="text-yellow-400" />
                  {label}
                  <ChevronRight size={13} className="ml-auto text-white/30 group-hover:text-white/70 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Catalogue produits */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-base">Catalogue</h3>
              <Link href="/admin/produits" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">
                Gérer →
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center">
                <Package size={24} className="text-orange-500" />
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900">{produits.length}</p>
                <p className="text-slate-400 text-sm">produits référencés</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
