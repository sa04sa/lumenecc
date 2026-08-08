import { getClients, getParametres, getDocumentById, getFactureLignes, getDocumentChildren } from "../../actions";
import InvoiceForm from "../../factures/nouvelle/InvoiceForm";
import DocumentActions from "@/components/admin/DocumentActions";
import { notFound } from "next/navigation";

export default async function EditDevisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const factureId = parseInt(id, 10);
  if (isNaN(factureId)) {
    notFound();
  }

  const facture = await getDocumentById(factureId);
  
  if (!facture) {
    notFound();
  }

  const lignes = await getFactureLignes(factureId);
  const clients = await getClients();
  const parametres = await getParametres();
  const childrenDocs = await getDocumentChildren(factureId);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {facture.statut === 'validee' ? 'Consulter le Devis' : 'Modifier le Brouillon'}
        </h1>
        <p className="text-slate-500 mt-1">
          {facture.statut === 'validee' 
            ? 'Ce document est validé et ne peut plus être modifié.' 
            : 'Vous pouvez modifier ce brouillon avant de le valider.'}
        </p>
      </div>

      <DocumentActions 
        document={facture}
        childrenDocs={childrenDocs}
        parametres={parametres}
      />

      <InvoiceForm 
        clients={clients} 
        parametres={parametres} 
        nextNumero={facture.numero}
        initialFacture={facture}
        initialLignes={lignes}
        documentType="devis"
        parentId={facture.parent_id}
        parentType={facture.parent_type}
        redirectTo="/admin/devis"
      />
    </div>
  );
}
