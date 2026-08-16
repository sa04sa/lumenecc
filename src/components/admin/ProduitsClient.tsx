"use client";

import { useState } from "react";
import { Plus, Search, Trash2, X, Package, Tag, Layers, DollarSign, Box, Edit, Dices } from "lucide-react";
import { addProduit, updateProduit, deleteProduit, resetAndSeedProduits } from "@/app/admin/actions";
import { RefreshCw } from "lucide-react";

interface Produit {
  reference: string;
  categorie: string | null;
  designation: string | null;
  unite: string | null;
  prix_achat: number | null;
  prix_vente: number | null;
}

export default function ProduitsClient({ initialProduits }: { initialProduits: Produit[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduit, setEditingProduit] = useState<Produit | null>(null);
  const [referenceInput, setReferenceInput] = useState("");
  const [designationInput, setDesignationInput] = useState("");
  const [categorieInput, setCategorieInput] = useState("");
  const [uniteInput, setUniteInput] = useState("U");
  const [prixAchatInput, setPrixAchatInput] = useState("");
  const [prixVenteInput, setPrixVenteInput] = useState("");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    if (confirm("Attention : cela va vider la liste actuelle et charger les 45 produits de référence. Continuer ?")) {
      setSeeding(true);
      try {
        await resetAndSeedProduits();
      } catch (e) {
        alert("Erreur lors de la réinitialisation des produits");
      } finally {
        setSeeding(false);
      }
    }
  };

  const generateRandomRef = () => {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    return `PRD-${randomDigits}`;
  };

  const openNewModal = () => {
    setEditingProduit(null);
    setReferenceInput(generateRandomRef());
    setDesignationInput("");
    setCategorieInput("");
    setUniteInput("U");
    setPrixAchatInput("");
    setPrixVenteInput("");
    setIsModalOpen(true);
  };

  const openEditModal = (produit: Produit) => {
    setEditingProduit(produit);
    setReferenceInput(produit.reference);
    setDesignationInput(produit.designation || "");
    setCategorieInput(produit.categorie || "");
    setUniteInput(produit.unite || "U");
    setPrixAchatInput(produit.prix_achat ? produit.prix_achat.toString() : "");
    setPrixVenteInput(produit.prix_vente ? produit.prix_vente.toString() : "");
    setIsModalOpen(true);
  };

  const filteredProduits = initialProduits.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.reference && p.reference.toLowerCase().includes(q)) ||
      (p.designation && p.designation.toLowerCase().includes(q)) ||
      (p.categorie && p.categorie.toLowerCase().includes(q))
    );
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      if (editingProduit) {
        await updateProduit(editingProduit.reference, formData);
      } else {
        await addProduit(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert("Erreur lors de l'enregistrement du produit");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ref: string) => {
    if (confirm(`Voulez-vous vraiment supprimer le produit ${ref} ?`)) {
      await deleteProduit(ref);
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* En-tête avec Bouton Ajouter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Catalogue Produits</h1>
          <p className="text-slate-500 mt-1">{initialProduits.length} référence(s) enregistrée(s)</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer disabled:opacity-50 text-sm"
            title="Vider et charger les 45 produits de référence"
          >
            <RefreshCw size={16} className={seeding ? "animate-spin" : ""} />
            Charger les 45 produits
          </button>
          <button
            onClick={openNewModal}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            <Plus size={18} />
            Nouveau Produit
          </button>
        </div>
      </div>

      {/* Barre de Recherche */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-3">
        <Search size={18} className="text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par référence, désignation ou catégorie..."
          className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none text-sm font-medium"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Tableau des Produits */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[65vh]">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-900 text-white z-10">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider w-36">Référence</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider w-36">Catégorie</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Désignation</th>
                <th className="px-4 py-4 font-semibold text-xs uppercase tracking-wider text-center w-20">Unité</th>
                <th className="px-4 py-4 font-semibold text-xs uppercase tracking-wider text-right w-32">Prix Achat HT</th>
                <th className="px-4 py-4 font-semibold text-xs uppercase tracking-wider text-right w-32">Prix Vente HT</th>
                <th className="px-4 py-4 font-semibold text-xs uppercase tracking-wider text-right w-28">Marge HT</th>
                <th className="px-4 py-4 w-20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProduits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <Package size={36} className="mx-auto mb-2 opacity-50" />
                    Aucun produit trouvé
                  </td>
                </tr>
              ) : (
                filteredProduits.map((p) => {
                  const pa = Number(p.prix_achat || 0);
                  const pv = Number(p.prix_vente || 0);
                  const marge = pv - pa;
                  return (
                    <tr key={p.reference} className="hover:bg-blue-50/40 transition-colors group">
                      <td className="px-6 py-3.5">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100 text-xs">
                          {p.reference}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 font-medium">
                        {p.categorie || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-6 py-3.5 text-slate-900 font-semibold">
                        {p.designation || <span className="italic text-slate-400">Sans désignation</span>}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          {p.unite || "U"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-slate-500">
                        {pa > 0 ? `${pa.toFixed(2)}` : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                        {pv > 0 ? `${pv.toFixed(2)}` : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold">
                        {pv > 0 || pa > 0 ? (
                          <span className={marge >= 0 ? "text-emerald-600" : "text-rose-600"}>
                            {marge >= 0 ? "+" : ""}{marge.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.reference)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajouter / Modifier Produit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-600/30 border border-blue-400/30 rounded-xl flex items-center justify-center">
                  <Package size={20} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {editingProduit ? "Modifier le produit" : "Ajouter un produit"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingProduit ? `Modification de ${editingProduit.reference}` : "Saisissez les informations du nouveau produit"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulaire Modal */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Référence avec bouton Générer */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Référence <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setReferenceInput(generateRandomRef())}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-bold transition-colors"
                    title="Générer une référence aléatoire"
                  >
                    <Dices size={13} />
                    Générer Réf. Aléatoire
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-blue-500 focus-within:bg-white transition-all">
                  <Tag size={16} className="text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    name="reference"
                    value={referenceInput}
                    onChange={(e) => setReferenceInput(e.target.value)}
                    required
                    placeholder="Ex: PRD-12345"
                    className="w-full bg-transparent font-mono text-slate-900 font-bold focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Désignation */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Désignation
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-blue-500 focus-within:bg-white transition-all">
                  <Box size={16} className="text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    name="designation"
                    value={designationInput}
                    onChange={(e) => setDesignationInput(e.target.value)}
                    placeholder="Ex: CABLE U500V 2.5 BLEU"
                    className="w-full bg-transparent text-slate-900 font-medium focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Catégorie & Unité */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Catégorie
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-blue-500 focus-within:bg-white transition-all">
                    <Layers size={16} className="text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      name="categorie"
                      value={categorieInput}
                      onChange={(e) => setCategorieInput(e.target.value)}
                      placeholder="Ex: Câble, Appareillage"
                      className="w-full bg-transparent text-slate-900 font-medium focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Unité
                  </label>
                  <select
                    name="unite"
                    value={uniteInput}
                    onChange={(e) => setUniteInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:bg-white focus:outline-none text-sm cursor-pointer"
                  >
                    <option value="U">Unité (U)</option>
                    <option value="ML">Mètre Linéaire (ML)</option>
                    <option value="KG">Kilogramme (KG)</option>
                    <option value="L">Litre (L)</option>
                    <option value="ROULEAU">Rouleau</option>
                    <option value="BOITE">Boîte</option>
                    <option value="LOT">Lot</option>
                  </select>
                </div>
              </div>

              {/* Prix Achat & Prix Vente */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Prix d&apos;Achat HT (MAD)
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-blue-500 focus-within:bg-white transition-all">
                    <DollarSign size={16} className="text-slate-400 flex-shrink-0" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="prix_achat"
                      value={prixAchatInput}
                      onChange={(e) => setPrixAchatInput(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-transparent text-slate-900 font-bold focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Prix de Vente HT (MAD)
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-blue-500 focus-within:bg-white transition-all">
                    <DollarSign size={16} className="text-slate-400 flex-shrink-0" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="prix_vente"
                      value={prixVenteInput}
                      onChange={(e) => setPrixVenteInput(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-transparent text-slate-900 font-bold focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons Modal */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors text-sm cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Enregistrement..." : editingProduit ? "Enregistrer les modifications" : "Ajouter le produit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
