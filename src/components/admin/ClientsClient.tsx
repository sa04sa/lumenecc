"use client";

import { useState } from "react";
import { Trash2, Users, Plus, Phone, Mail, MapPin, Edit, X, Building2, Hash } from "lucide-react";
import { addClient, deleteClient, updateClient } from "@/app/admin/actions";

interface Client {
  id: number;
  nom: string;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  ice: string | null;
}

export default function ClientsClient({ initialClients }: { initialClients: Client[] }) {
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state for edit modal
  const [nomInput, setNomInput] = useState("");
  const [adresseInput, setAdresseInput] = useState("");
  const [telephoneInput, setTelephoneInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [iceInput, setIceInput] = useState("");

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setNomInput(client.nom || "");
    setAdresseInput(client.adresse || "");
    setTelephoneInput(client.telephone || "");
    setEmailInput(client.email || "");
    setIceInput(client.ice || "");
  };

  const closeModal = () => setEditingClient(null);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingClient) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await updateClient(editingClient.id, formData);
      closeModal();
    } catch {
      alert("Erreur lors de la mise à jour du client");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, nom: string) => {
    if (confirm(`Voulez-vous vraiment supprimer le client "${nom}" ?`)) {
      await deleteClient(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
        <p className="text-slate-500 mt-1">{initialClients.length} client{initialClients.length > 1 ? "s" : ""} enregistré{initialClients.length > 1 ? "s" : ""}</p>
      </div>

      {/* Add Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
          <span className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
            <Plus size={16} className="text-violet-600" />
          </span>
          Ajouter un client
        </h2>
        <form action={addClient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nom *</label>
            <input type="text" name="nom" required placeholder="Nom ou raison sociale" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Téléphone</label>
            <input type="text" name="telephone" placeholder="0600000000" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input type="email" name="email" placeholder="email@exemple.com" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Adresse</label>
            <input type="text" name="adresse" placeholder="Adresse complète" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">ICE</label>
            <input type="text" name="ice" placeholder="N° ICE (ex: 001234567890000)" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all" />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/30">
              Enregistrer le client
            </button>
          </div>
        </form>
      </div>

      {/* Clients Grid */}
      {initialClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {initialClients.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {c.nom?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{c.nom}</h3>
                    {c.ice && <p className="text-xs font-mono text-slate-400">ICE: {c.ice}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => openEditModal(c)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.nom)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {c.telephone && (
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Phone size={14} className="text-slate-400" />
                    {c.telephone}
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Mail size={14} className="text-slate-400" />
                    {c.email}
                  </div>
                )}
                {c.adresse && (
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <MapPin size={14} className="text-slate-400" />
                    {c.adresse}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 py-20 text-center">
          <Users size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Aucun client enregistré</p>
        </div>
      )}

      {/* Edit Modal */}
      {editingClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-violet-600/30 border border-violet-400/30 rounded-xl flex items-center justify-center">
                  <Building2 size={20} className="text-violet-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Modifier le client</h3>
                  <p className="text-xs text-slate-400">Modification de {editingClient.nom}</p>
                </div>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Nom / Raison sociale <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-violet-400 focus-within:bg-white transition-all">
                    <Building2 size={16} className="text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      name="nom"
                      value={nomInput}
                      onChange={(e) => setNomInput(e.target.value)}
                      required
                      className="w-full bg-transparent text-slate-900 font-semibold focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Téléphone</label>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-violet-400 focus-within:bg-white transition-all">
                      <Phone size={16} className="text-slate-400 flex-shrink-0" />
                      <input
                        type="text"
                        name="telephone"
                        value={telephoneInput}
                        onChange={(e) => setTelephoneInput(e.target.value)}
                        className="w-full bg-transparent text-slate-900 focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Email</label>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-violet-400 focus-within:bg-white transition-all">
                      <Mail size={16} className="text-slate-400 flex-shrink-0" />
                      <input
                        type="email"
                        name="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full bg-transparent text-slate-900 focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Adresse</label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-violet-400 focus-within:bg-white transition-all">
                    <MapPin size={16} className="text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      name="adresse"
                      value={adresseInput}
                      onChange={(e) => setAdresseInput(e.target.value)}
                      className="w-full bg-transparent text-slate-900 focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">ICE</label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-violet-400 focus-within:bg-white transition-all">
                    <Hash size={16} className="text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      name="ice"
                      value={iceInput}
                      onChange={(e) => setIceInput(e.target.value)}
                      placeholder="001234567890000"
                      className="w-full bg-transparent text-slate-900 font-mono focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors text-sm cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-violet-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
