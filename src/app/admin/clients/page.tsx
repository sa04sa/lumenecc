import { getClients, addClient, deleteClient } from "../actions";
import { Trash2, Users, Plus, Phone, Mail, MapPin } from "lucide-react";

export default async function ClientsPage() {
  const clients = await getClients() as any[];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
        <p className="text-slate-500 mt-1">{clients.length} client{clients.length > 1 ? 's' : ''} enregistré{clients.length > 1 ? 's' : ''}</p>
      </div>

      {/* Add Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
          <span className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center"><Plus size={16} className="text-violet-600" /></span>
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
          <div className="md:col-span-2">
            <button type="submit" className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/30">
              Enregistrer le client
            </button>
          </div>
        </form>
      </div>

      {/* Clients Grid */}
      {clients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((c: any) => (
            <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {c.nom?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{c.nom}</h3>
                  </div>
                </div>
                <form action={async () => { "use server"; await deleteClient(c.id); }}>
                  <button type="submit" className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 size={16} />
                  </button>
                </form>
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
    </div>
  );
}
