"use client";

import { useState } from "react";
import { updateParametres } from "../actions";
import { Save, Building2, CheckCircle2 } from "lucide-react";

export default function ParametresForm({ parametres }: { parametres: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setSuccess(false);
    try {
      await updateParametres(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-2xl relative overflow-hidden">
      {success && (
        <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white text-sm font-bold py-2 px-4 flex items-center justify-center gap-2 animate-in slide-in-from-top">
          <CheckCircle2 size={16} />
          Paramètres enregistrés avec succès
        </div>
      )}

      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100 mt-2">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Building2 size={22} className="text-white" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-lg">Entreprise</h2>
          <p className="text-slate-500 text-sm">Ces informations apparaissent sur vos factures</p>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nom de l'entreprise *</label>
          <input type="text" name="nom" defaultValue={parametres?.nom} required
            className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Adresse</label>
          <textarea name="adresse" defaultValue={parametres?.adresse} rows={3}
            className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Téléphone</label>
            <input type="text" name="telephone" defaultValue={parametres?.telephone}
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
            <input type="email" name="email" defaultValue={parametres?.email}
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Site web</label>
          <input type="text" name="siteweb" defaultValue={parametres?.siteweb} placeholder="www.votre-site.com"
            className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-400" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Devise</label>
            <input type="text" name="devise" defaultValue={parametres?.devise || 'MAD'}
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Taux de TVA (%)</label>
            <input type="number" step="0.01" name="tva" defaultValue={parametres?.tva || '20'}
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 w-full justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70">
            <Save size={18} />
            {loading ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}
