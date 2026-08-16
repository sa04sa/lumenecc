import { getClients } from "../actions";
import ClientsClient from "@/components/admin/ClientsClient";

export default async function ClientsPage() {
  const clients = (await getClients()) as any[];
  return <ClientsClient initialClients={clients} />;
}
