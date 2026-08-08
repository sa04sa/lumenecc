import { getParametres } from "../actions";
import ParametresForm from "./ParametresForm";

export default async function ParametresPage() {
  const p = await getParametres();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Paramètres</h1>
        <p className="text-slate-500 mt-1">Informations de votre entreprise affichées sur les factures</p>
      </div>

      <ParametresForm parametres={p} />
    </div>
  );
}
