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

  const inp = (label: string, name: string, type = "text", placeholder = "", defaultValue?: any) => (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <input type={type} name={name} defaultValue={defaultValue} placeholder={placeholder}
        className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-400" />
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-2xl relative overflow-hidden">
      {success && (
        <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white text-sm font-bold py-2 px-4 flex items-center justify-center gap-2">
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

      <form action={handleSubmit} className="space-y-6">

        {/* ── Infos générales ── */}
        <div className="space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Informations générales</p>
          {inp("Nom de l'entreprise *", "nom", "text", "LUMENEC", parametres?.nom)}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Adresse</label>
            <textarea name="adresse" defaultValue={parametres?.adresse} rows={2} placeholder="Adresse complète"
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {inp("Téléphone", "telephone", "text", "05 XX XX XX XX", parametres?.telephone)}
            {inp("Fax", "fax", "text", "05 XX XX XX XX", parametres?.fax)}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {inp("Email", "email", "email", "contact@entreprise.com", parametres?.email)}
            {inp("Site web", "siteweb", "text", "www.entreprise.com", parametres?.siteweb)}
          </div>
        </div>

        {/* ── Identifiants fiscaux ── */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Identifiants fiscaux &amp; légaux</p>
          <div className="grid grid-cols-2 gap-4">
            {inp("R.C. (Registre Commercial)", "rc", "text", "Ex: 180435", parametres?.rc)}
            {inp("Patente", "patente", "text", "Ex: 32090042", parametres?.patente)}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {inp("I.F. (Identifiant Fiscal)", "if_taxe", "text", "Ex: 2263121", parametres?.if_taxe)}
            {inp("C.N.S.S.", "cnss", "text", "Ex: 7765673", parametres?.cnss)}
          </div>
          {inp("ICE (Identifiant Commun de l'Entreprise)", "ice", "text", "Ex: 000038274000040", parametres?.ice)}
        </div>

        {/* ── Paramètres de facturation ── */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Paramètres de facturation</p>
          <div className="grid grid-cols-2 gap-4">
            {inp("Devise", "devise", "text", "MAD", parametres?.devise || "MAD")}
            {inp("Taux de TVA (%)", "tva", "number", "20", parametres?.tva || "20")}
          </div>
        </div>

        <div className="pt-2">
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
