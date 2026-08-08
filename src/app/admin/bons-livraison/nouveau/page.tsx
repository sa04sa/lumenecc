import { getClients, getParametres, generateNumeroDocument, getDocumentById, getFactureLignes, getDeliveryProgress } from "../../actions";
import InvoiceForm from "../../factures/nouvelle/InvoiceForm";

export default async function NouveauBonLivraisonPage({ searchParams }: { searchParams: Promise<{ from?: string, fromType?: string }> }) {
  const sp = await searchParams;
  const clients = await getClients() as any[];
  const parametres = await getParametres();
  const nextNumero = await generateNumeroDocument('bon_livraison');

  let initialFacture = null;
  let initialLignes: any[] = [];
  
  if (sp.from) {
    const parentId = parseInt(sp.from);
    const parent = await getDocumentById(parentId);
    
    if (parent) {
      initialFacture = { 
        client_id: parent.client_id,
        date: new Date().toISOString().split('T')[0],
        document_type: 'bon_livraison'
      };
      
      if (sp.fromType === 'bon_commande') {
        const progress = await getDeliveryProgress(parentId);
        // Only include items that haven't been fully delivered
        initialLignes = progress
          .filter((p: any) => p.qty_remaining > 0)
          .map((p: any, index: number) => ({
            id: Date.now() + index,
            produit_ref: p.produit_ref,
            designation: p.designation,
            quantite: p.qty_remaining,
            prix_unitaire: p.prix_unitaire,
            total_ligne: p.qty_remaining * p.prix_unitaire
          }));
      } else {
         const parentLignes = await getFactureLignes(parentId);
         initialLignes = parentLignes;
      }
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Nouveau Bon de Livraison</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <InvoiceForm 
          clients={clients} 
          parametres={parametres} 
          nextNumero={nextNumero}
          initialFacture={initialFacture}
          initialLignes={initialLignes}
          documentType="bon_livraison"
          parentId={sp.from ? parseInt(sp.from) : null}
          parentType={sp.fromType || null}
          redirectTo="/admin/bons-livraison"
        />
      </div>
    </div>
  );
}
