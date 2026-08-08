"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, Trash2, Search, CheckCircle, FileText, User, Calendar, Hash, FileClock, RotateCcw, AlertTriangle, Link2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Ligne {
  id: number;
  produit_ref: string;
  designation: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
}

interface SearchResult {
  reference: string;
  designation: string | null;
  categorie: string | null;
  unite: string | null;
  prix_vente: number | null;
}

export default function InvoiceForm({ clients, parametres, nextNumero, initialFacture = null, initialLignes = [], documentType = "facture", parentId = null, parentType = null, redirectTo = "/admin/factures" }: any) {
  const router = useRouter();
  const isReadOnly = initialFacture?.statut === "validee";

  const [factureId, setFactureId] = useState<number | null>(initialFacture?.id || null);
  const [numero, setNumero] = useState<string>(initialFacture?.numero || nextNumero);
  
  const [lignes, setLignes] = useState<Ligne[]>(
    initialLignes.length > 0 ? initialLignes : [{ id: Date.now(), produit_ref: "", designation: "", quantite: 1, prix_unitaire: 0, total_ligne: 0 }]
  );
  
  const [clientId, setClientId] = useState<string>(initialFacture?.client_id?.toString() || clients[0]?.id?.toString() || "");
  // Format initial date for input type="date"
  const initialDate = initialFacture?.date 
    ? new Date(initialFacture.date).toISOString().split("T")[0] 
    : new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(initialDate);

  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Search State
  const [searchResults, setSearchResults] = useState<{ index: number; results: SearchResult[] } | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const searchTimeout = useRef<any>(null);

  const totalHT = lignes.reduce((s, l) => s + Number(l.total_ligne), 0);
  const tvaRate = Number(parametres?.tva) || 20;
  const montantTVA = (totalHT * tvaRate) / 100;
  const totalTTC = totalHT + montantTVA;
  const devise = parametres?.devise || "MAD";

  // --- AUTO-SAVE LOGIC ---
  const saveToDb = useCallback(async (statut: "validee" | "brouillon", isAutoSave = false) => {
    if (isReadOnly) return;
    
    const validLignes = lignes.filter(l => l.designation.trim() !== "");
    
    // For auto-save, we only save if there's at least a client and one valid line
    if (isAutoSave && (!clientId || validLignes.length === 0)) {
      return;
    }
    
    if (!isAutoSave) {
      if (!clientId) return alert("Veuillez sélectionner un client");
      if (validLignes.length === 0) return alert("Ajoutez au moins un produit");
      setSaving(true);
    } else {
      setAutoSaving(true);
    }

    try {
      const payload = {
        numero,
        date,
        client_id: clientId,
        total_ht: totalHT,
        tva: montantTVA,
        total_ttc: totalTTC,
        statut,
        document_type: documentType,
        parent_id: parentId,
        parent_type: parentType,
        lignes: validLignes
      };

      let res;
      if (factureId) {
        // Update existing
        res = await fetch(`/api/factures/${factureId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new
        res = await fetch("/api/factures", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        const data = await res.json();
        if (!factureId && data.facture_id) {
          setFactureId(data.facture_id);
        }
        setLastSaved(new Date());
        
        if (!isAutoSave) {
          router.push(redirectTo);
          router.refresh();
        }
      } else {
        if (!isAutoSave) alert("Erreur lors de la sauvegarde");
      }
    } catch (err) {
      if (!isAutoSave) alert("Erreur serveur lors de l'enregistrement");
      console.error("Save error:", err);
    } finally {
      setSaving(false);
      setAutoSaving(false);
    }
  }, [factureId, numero, date, clientId, totalHT, montantTVA, totalTTC, lignes, isReadOnly, router, documentType, parentId, parentType, redirectTo]);

  // Debounced auto-save effect
  useEffect(() => {
    if (isReadOnly) return;
    
    const timer = setTimeout(() => {
      saveToDb("brouillon", true);
    }, 3000); // 3 seconds delay after last change
    
    return () => clearTimeout(timer);
  }, [clientId, date, lignes, isReadOnly, saveToDb]);

  // --- HANDLERS ---
  const handleSearch = (index: number, term: string) => {
    if (isReadOnly) return;
    updateLigne(index, "designation", term);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (term.length < 1) { 
      setSearchResults(null); 
      return; 
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/produits/search?q=${encodeURIComponent(term)}`);
        const data: SearchResult[] = await res.json();
        setSearchResults({ index, results: data });
        setHighlightedIndex(0);
      } catch (err) {
        console.error("Search error", err);
      }
    }, 150);
  };

  const selectProduit = (index: number, produit: SearchResult) => {
    if (isReadOnly) return;

    // Vérifier si le produit existe déjà dans une autre ligne
    const existingIndex = lignes.findIndex((l, i) => i !== index && l.produit_ref === produit.reference);
    
    if (existingIndex !== -1) {
      // Le produit existe déjà, on fusionne les quantités
      const newLignes = [...lignes];
      const existingLine = newLignes[existingIndex];
      const addedQte = newLignes[index].quantite || 1;
      
      existingLine.quantite += addedQte;
      existingLine.total_ligne = existingLine.quantite * existingLine.prix_unitaire;
      
      // On vide la ligne actuelle pour permettre une nouvelle recherche, sauf si c'est la seule ligne
      if (lignes.length > 1) {
        newLignes.splice(index, 1);
      } else {
        newLignes[index] = {
          id: newLignes[index].id,
          produit_ref: "",
          designation: "",
          quantite: 1,
          prix_unitaire: 0,
          total_ligne: 0
        };
      }
      
      setLignes(newLignes);
      setSearchResults(null);
      return;
    }

    const newLignes = [...lignes];
    const qte = newLignes[index].quantite || 1;
    const pu = Number(produit.prix_vente) || 0;
    newLignes[index] = {
      ...newLignes[index],
      produit_ref: produit.reference,
      designation: produit.designation || produit.reference,
      prix_unitaire: pu,
      total_ligne: qte * pu,
    };
    setLignes(newLignes);
    setSearchResults(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (isReadOnly || !searchResults || searchResults.index !== index || searchResults.results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < searchResults.results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : searchResults.results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (searchResults.results[highlightedIndex]) {
        selectProduit(index, searchResults.results[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setSearchResults(null);
    }
  };

  const updateLigne = (index: number, field: string, value: any) => {
    if (isReadOnly) return;
    const newLignes = [...lignes];
    (newLignes[index] as any)[field] = value;
    if (field === "quantite" || field === "prix_unitaire") {
      newLignes[index].total_ligne = Number(newLignes[index].quantite) * Number(newLignes[index].prix_unitaire);
    }
    setLignes([...newLignes]);
  };

  const addLigne = () => {
    if (isReadOnly) return;
    setLignes(prev => [...prev, { id: Date.now(), produit_ref: "", designation: "", quantite: 1, prix_unitaire: 0, total_ligne: 0 }]);
  };

  const removeLigne = (index: number) => {
    if (isReadOnly || lignes.length === 1) return;
    setLignes(prev => prev.filter((_, i) => i !== index));
  };

  const getDocTypeLabel = () => {
    if (documentType === 'devis') return 'le Devis';
    if (documentType === 'bon_commande') return 'le Bon de Commande';
    if (documentType === 'bon_livraison') return 'le Bon de Livraison';
    return 'la Facture';
  };

  const getDocTypeName = () => {
    if (documentType === 'devis') return 'Devis';
    if (documentType === 'bon_commande') return 'Bon de Commande';
    if (documentType === 'bon_livraison') return 'Bon de Livraison';
    return 'Facture';
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Banner Issu de */}
      {parentId && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
          <Link2 size={18} className="text-blue-600" />
          <span className="text-sm font-semibold text-blue-900">
            Créé depuis : <span className="font-mono">{parentType?.toUpperCase()} #{parentId}</span>
          </span>
        </div>
      )}

      {/* Banner Mode Lecture */}
      {isReadOnly && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700">
            <CheckCircle size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-900">{getDocTypeName()} Validé(e) - Mode Lecture</p>
            <p className="text-xs text-emerald-700">Ce document a été validé et ne peut plus être modifié.</p>
          </div>
        </div>
      )}

      {/* Indicateur de sauvegarde auto */}
      {!isReadOnly && (
        <div className="flex justify-end text-xs text-slate-500 font-medium h-4">
          {autoSaving ? (
            <span className="flex items-center gap-1"><RotateCcw size={12} className="animate-spin" /> Sauvegarde automatique...</span>
          ) : lastSaved ? (
            <span className="flex items-center gap-1 text-emerald-600"><CheckCircle size={12} /> Brouillon sauvegardé à {lastSaved.toLocaleTimeString()}</span>
          ) : null}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); saveToDb("validee"); }} className="space-y-6">
        {/* En-tête facture */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Numéro */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Hash size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Numéro</p>
              <p className="text-lg font-bold text-slate-900 font-mono">{numero}</p>
            </div>
          </div>

          {/* Date */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar size={18} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Date</p>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                disabled={isReadOnly}
                className="w-full bg-transparent text-slate-900 font-semibold focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Client */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-violet-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Client</p>
              <select
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                required
                disabled={isReadOnly}
                className="w-full bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <option value="" className="text-slate-900">Sélectionner un client...</option>
                {clients.map((c: any) => (
                  <option key={c.id} value={c.id} className="text-slate-900">{c.nom}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tableau des produits */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-visible shadow-sm">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 bg-slate-50/80 rounded-t-2xl">
            <FileText size={18} className="text-slate-500" />
            <h3 className="font-bold text-slate-800">Lignes de {documentType === 'facture' ? 'facture' : documentType.replace('_', ' ')}</h3>
            <span className="ml-auto text-xs text-slate-600 bg-slate-200 px-2.5 py-1 rounded-full font-medium">{lignes.length} ligne{lignes.length > 1 ? "s" : ""}</span>
          </div>

          <div className="overflow-visible">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider w-40">Référence</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider">Désignation</th>
                  <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider w-24">Qté</th>
                  <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wider w-36">PU HT ({devise})</th>
                  <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wider w-40">Total HT ({devise})</th>
                  {!isReadOnly && <th className="w-12"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lignes.map((ligne, index) => (
                  <tr key={ligne.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={ligne.produit_ref}
                        onChange={e => updateLigne(index, "produit_ref", e.target.value)}
                        disabled={isReadOnly}
                        className="w-full font-mono text-xs text-blue-700 bg-slate-50 px-2 py-1.5 rounded border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none transition-all disabled:opacity-70 disabled:bg-slate-100"
                        placeholder="Réf."
                      />
                    </td>

                    <td className="px-4 py-2 relative">
                      <div className={`flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded border border-slate-200 transition-all ${!isReadOnly && 'focus-within:border-blue-500 focus-within:bg-white'} ${isReadOnly && 'opacity-70 bg-slate-100'}`}>
                        <Search size={14} className="text-slate-400 flex-shrink-0" />
                        <input
                          type="text"
                          value={ligne.designation}
                          onChange={e => handleSearch(index, e.target.value)}
                          onKeyDown={e => handleKeyDown(e, index)}
                          onFocus={() => {
                            if (!isReadOnly && ligne.designation.length >= 1) handleSearch(index, ligne.designation);
                          }}
                          onBlur={() => setTimeout(() => setSearchResults(null), 250)}
                          disabled={isReadOnly}
                          className="w-full bg-transparent text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none text-sm disabled:cursor-not-allowed"
                          placeholder="Ex: CABLE, 2.5..."
                        />
                      </div>

                      {/* Liste déroulante */}
                      {!isReadOnly && searchResults?.index === index && searchResults.results.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-72 overflow-y-auto text-slate-900">
                          <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex justify-between items-center text-xs text-slate-600 font-medium">
                            <span>{searchResults.results.length} produit(s)</span>
                          </div>
                          {searchResults.results.map((p, pIdx) => (
                            <div
                              key={p.reference}
                              onMouseDown={() => selectProduit(index, p)}
                              onMouseEnter={() => setHighlightedIndex(pIdx)}
                              className={`flex items-center justify-between px-4 py-2.5 cursor-pointer border-b border-slate-100 last:border-0 transition-colors ${
                                pIdx === highlightedIndex ? "bg-blue-600 text-white" : "hover:bg-blue-50 text-slate-900"
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <span className={`font-mono font-bold text-xs px-1.5 py-0.5 rounded mr-2 ${
                                  pIdx === highlightedIndex ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"
                                }`}>
                                  {p.reference}
                                </span>
                                <span className={`text-sm font-medium ${pIdx === highlightedIndex ? "text-white" : "text-slate-900"}`}>
                                  {p.designation || "Sans désignation"}
                                </span>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <span className={`font-bold text-sm ${pIdx === highlightedIndex ? "text-yellow-300" : "text-emerald-600"}`}>
                                  {p.prix_vente ? Number(p.prix_vente).toFixed(2) : "0.00"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="1"
                        value={ligne.quantite}
                        onChange={e => updateLigne(index, "quantite", Number(e.target.value))}
                        disabled={isReadOnly}
                        className="w-full text-center bg-slate-50 text-slate-900 font-bold px-2 py-1.5 rounded border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none transition-all disabled:opacity-70 disabled:bg-slate-100"
                      />
                    </td>

                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={ligne.prix_unitaire}
                        onChange={e => updateLigne(index, "prix_unitaire", Number(e.target.value))}
                        disabled={isReadOnly}
                        className="w-full text-right bg-slate-50 text-slate-900 font-bold px-2 py-1.5 rounded border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none transition-all disabled:opacity-70 disabled:bg-slate-100"
                      />
                    </td>

                    <td className="px-4 py-2 text-right">
                      <span className="font-bold text-slate-900">{Number(ligne.total_ligne).toFixed(2)}</span>
                    </td>

                    {!isReadOnly && (
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeLigne(index)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Supprimer la ligne"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isReadOnly && (
            <button
              type="button"
              onClick={addLigne}
              className="flex items-center gap-2 w-full px-6 py-3.5 text-blue-600 hover:bg-blue-50 border-t border-slate-200 text-sm font-semibold transition-colors bg-slate-50/50"
            >
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                <Plus size={14} />
              </div>
              Ajouter une ligne
            </button>
          )}
        </div>

        {/* Totaux */}
        <div className="flex justify-end">
          <div className="bg-slate-900 text-white rounded-2xl p-6 w-80 space-y-3 shadow-lg">
            <div className="flex justify-between text-slate-300 text-sm">
              <span>Total HT</span>
              <span className="font-semibold text-white">{totalHT.toFixed(2)} {devise}</span>
            </div>
            <div className="flex justify-between text-slate-300 text-sm">
              <span>TVA ({tvaRate}%)</span>
              <span className="font-semibold text-white">{montantTVA.toFixed(2)} {devise}</span>
            </div>
            <div className="border-t border-slate-700 pt-3 flex justify-between text-xl font-bold">
              <span>Total TTC</span>
              <span className="text-yellow-400">{totalTTC.toFixed(2)} {devise}</span>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        {!isReadOnly && (
          <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={() => saveToDb("brouillon", false)}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-6 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60 cursor-pointer border border-slate-300"
            >
              <FileClock size={18} className="text-amber-600" />
              {saving ? "..." : "Enregistrer et Quitter"}
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-3.5 rounded-xl font-bold text-base hover:from-emerald-400 hover:to-green-500 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-60 cursor-pointer"
            >
              <CheckCircle size={20} />
              Valider {getDocTypeLabel()}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
