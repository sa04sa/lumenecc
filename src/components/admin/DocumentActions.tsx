"use client";

import Link from "next/link";
import { FileText, Link2, ArrowRight } from "lucide-react";

interface Props {
  document: any;
  childrenDocs: any[];
  progress?: any[];
  parametres: any;
}

function routeFromType(type: string) {
  const map: Record<string, string> = {
    devis: "devis",
    bon_commande: "bons-commande",
    bon_livraison: "bons-livraison",
    facture: "factures",
  };
  return map[type] || "factures";
}

function labelFromType(type: string) {
  const map: Record<string, string> = {
    devis: "Devis",
    bon_commande: "Bon de Commande",
    bon_livraison: "Bon de Livraison",
    facture: "Facture",
  };
  return map[type] || "Document";
}

export default function DocumentActions({ document, childrenDocs = [], progress = [] }: Props) {
  const isValidee = document.statut === "validee";
  
  // Calculate if the BC is completely delivered
  const isFullyDelivered = progress.length > 0 && progress.every((p: any) => p.qty_remaining <= 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Link2 size={18} className="text-slate-400" />
          Actions & Traçabilité
        </h3>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Parent Reference */}
        {document.parent_id && (
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Document source</p>
            <Link
              href={`/admin/${routeFromType(document.parent_type)}/${document.parent_id}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FileText size={16} />
              Issu du {labelFromType(document.parent_type)} #{document.parent_id}
            </Link>
          </div>
        )}

        {/* Children Reference */}
        {childrenDocs.length > 0 && (
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Documents générés</p>
            <div className="space-y-2">
              {childrenDocs.map((child: any) => (
                <Link
                  key={child.id}
                  href={`/admin/${routeFromType(child.document_type)}/${child.id}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <FileText size={16} className="text-slate-500 group-hover:text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-700 font-mono text-sm">{child.numero}</p>
                      <p className="text-xs text-slate-500">{labelFromType(child.document_type)}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    child.statut === "validee" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {child.statut === "validee" ? "VALIDÉ" : "BROUILLON"}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Progress (For BC only) */}
        {document.document_type === "bon_commande" && progress.length > 0 && (
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Suivi des livraisons</p>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="px-4 py-2 font-semibold">Produit</th>
                    <th className="px-4 py-2 font-semibold text-center">Commandé</th>
                    <th className="px-4 py-2 font-semibold text-center">Livré</th>
                    <th className="px-4 py-2 font-semibold text-center">Restant</th>
                    <th className="px-4 py-2 font-semibold w-32">Avancement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {progress.map((p: any, idx: number) => {
                    const percentage = Math.min(100, Math.round((p.qty_delivered / p.qty_ordered) * 100)) || 0;
                    return (
                      <tr key={idx}>
                        <td className="px-4 py-3 font-medium text-slate-800">{p.designation}</td>
                        <td className="px-4 py-3 text-center">{p.qty_ordered}</td>
                        <td className="px-4 py-3 text-center text-emerald-600 font-semibold">{p.qty_delivered}</td>
                        <td className="px-4 py-3 text-center text-amber-600 font-semibold">{Math.max(0, p.qty_remaining)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${percentage >= 100 ? 'bg-emerald-500' : percentage > 0 ? 'bg-amber-400' : 'bg-slate-300'}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 w-8">{percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isValidee && (
          <div className="pt-4 border-t border-slate-100">
            {document.document_type === "devis" && childrenDocs.length === 0 && (
              <Link
                href={`/admin/bons-commande/nouveau?from=${document.id}&fromType=devis`}
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-md"
              >
                Créer un Bon de Commande <ArrowRight size={18} />
              </Link>
            )}

            {document.document_type === "devis" && childrenDocs.length > 0 && (
              <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-500 border border-slate-200 px-5 py-2.5 rounded-xl font-semibold">
                Bon de Commande déjà généré ✓
              </div>
            )}

            {document.document_type === "bon_commande" && !isFullyDelivered && (
              <Link
                href={`/admin/bons-livraison/nouveau?from=${document.id}&fromType=bon_commande`}
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-md"
              >
                Créer un Bon de Livraison <ArrowRight size={18} />
              </Link>
            )}
            
            {document.document_type === "bon_commande" && isFullyDelivered && (
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-5 py-2.5 rounded-xl font-semibold">
                Commande totalement livrée ✓
              </div>
            )}

            {document.document_type === "bon_livraison" && childrenDocs.length === 0 && (
              <Link
                href={`/admin/factures/nouvelle?from=${document.id}&fromType=bon_livraison`}
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-md"
              >
                Créer une Facture <ArrowRight size={18} />
              </Link>
            )}

            {document.document_type === "bon_livraison" && childrenDocs.length > 0 && (
              <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-500 border border-slate-200 px-5 py-2.5 rounded-xl font-semibold">
                Facture déjà générée ✓
              </div>
            )}

            {document.document_type === "facture" && (
              <div className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                Fin de chaîne documentaire
              </div>
            )}
          </div>
        )}
        
        {!isValidee && (
          <div className="pt-4 border-t border-slate-100 text-sm text-slate-500">
            Validez ce document pour pouvoir générer la suite.
          </div>
        )}
      </div>
    </div>
  );
}
