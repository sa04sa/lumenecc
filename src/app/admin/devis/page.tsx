import { getDocuments, getParametres } from "../actions";
import Link from "next/link";
import { Plus, FileText, Clock, CheckCircle2, Edit, Eye, ArrowRight } from "lucide-react";
import PDFButton from "@/components/admin/PDFButton";

export default async function DevisPage() {
  const factures = (await getDocuments('devis')) as any[];
  const parametres = await getParametres();

  return (
    <div className="space-y-8 text-slate-900">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Devis</h1>
          <p className="text-slate-500 mt-1">{factures.length} devis</p>
        </div>
        <Link
          href="/admin/devis/nouveau"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:from-yellow-400 hover:to-orange-400 transition-all shadow-lg shadow-orange-500/30"
        >
          <Plus size={18} />
          Nouveau devis
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {factures.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-900 text-white">
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Numéro</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Total HT</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Total TTC</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-center">PDF</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {factures.map((f: any) => {
                const isDraft = f.statut === "brouillon";
                return (
                  <tr key={f.id} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg text-sm border border-blue-100">
                        <FileText size={14} />
                        {f.numero}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isDraft ? (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                          <Clock size={12} />
                          BROUILLON
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                          <CheckCircle2 size={12} />
                          VALIDÉE
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {new Date(f.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center font-bold text-violet-600 text-xs flex-shrink-0">
                          {f.client_nom?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900">{f.client_nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600">
                      {Number(f.total_ht).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      {Number(f.total_ttc).toFixed(2)} MAD
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <PDFButton facture={f} parametres={parametres} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        {!isDraft && !f.has_children && (
                          <Link
                            href={`/admin/bons-commande/nouveau?from=${f.id}&fromType=devis`}
                            className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Créer un Bon de Commande"
                          >
                            <ArrowRight size={18} />
                          </Link>
                        )}
                        <Link
                          href={`/admin/devis/${f.id}`}
                          className={`p-2 rounded-lg transition-colors ${
                            isDraft 
                              ? "text-blue-600 hover:bg-blue-50" 
                              : "text-slate-500 hover:bg-slate-100"
                          }`}
                          title={isDraft ? "Éditer le brouillon" : "Consulter le devis"}
                        >
                          {isDraft ? <Edit size={18} /> : <Eye size={18} />}
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="py-24 text-center">
            <FileText size={52} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-800 font-bold text-lg mb-1">Aucun devis</h3>
            <p className="text-slate-500 mb-6">Créez votre premier devis dès maintenant</p>
            <Link
              href="/admin/devis/nouveau"
              className="inline-flex items-center gap-2 bg-yellow-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-yellow-400 transition-all shadow-md shadow-yellow-500/20"
            >
              <Plus size={18} /> Créer un devis
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
