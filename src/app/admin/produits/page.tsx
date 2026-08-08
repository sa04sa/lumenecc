import { getProduits } from "../actions";
import ProduitsClient from "@/components/admin/ProduitsClient";

export default async function ProduitsPage() {
  const produits = (await getProduits()) as any[];

  return <ProduitsClient initialProduits={produits} />;
}
