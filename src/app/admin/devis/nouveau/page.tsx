import { getClients, getParametres, generateNumeroDocument, getDocumentById, getFactureLignes } from "../../actions";
import InvoiceForm from "../../factures/nouvelle/InvoiceForm";

export default async function NouveauDevisPage({ searchParams }: { searchParams: Promise<{ from?: string, fromType?: string }> }) {
  const sp = await searchParams;
  const clients = await getClients() as any[];
  const parametres = await getParametres();
  const nextNumero = await generateNumeroDocument('devis');

  let initialFacture = null;
  let initialLignes: any[] = [];
  
  if (sp.from) {
    const parentId = parseInt(sp.from);
    const parent = await getDocumentById(parentId);
    const parentLignes = await getFactureLignes(parentId);
    if (parent) {
      initialFacture = { 
        client_id: parent.client_id,
        date: new Date().toISOString().split('T')[0],
        document_type: 'devis'
      };
      initialLignes = parentLignes;
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Nouveau Devis</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <InvoiceForm 
          clients={clients} 
          parametres={parametres} 
          nextNumero={nextNumero}
          initialFacture={initialFacture}
          initialLignes={initialLignes}
          documentType="devis" 
          parentId={sp.from ? parseInt(sp.from) : null}
          parentType={sp.fromType || null}
          redirectTo="/admin/devis"
        />
      </div>
    </div>
  );
}
