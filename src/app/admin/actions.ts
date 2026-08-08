"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

// --- CLIENTS ---
export async function getClients() {
  return await query("SELECT * FROM clients ORDER BY nom ASC");
}

export async function addClient(formData: FormData) {
  const nom = formData.get("nom") as string;
  const adresse = formData.get("adresse") as string;
  const telephone = formData.get("telephone") as string;
  const email = formData.get("email") as string;
  
  await query("INSERT INTO clients (nom, adresse, telephone, email) VALUES (?, ?, ?, ?)", [nom, adresse, telephone, email]);
  revalidatePath("/admin/clients");
}

export async function deleteClient(id: number) {
  await query("DELETE FROM clients WHERE id = ?", [id]);
  revalidatePath("/admin/clients");
}

// --- PRODUITS ---
export async function getProduits() {
  return await query("SELECT * FROM produits ORDER BY reference DESC");
}

export async function searchProduits(term: string) {
  const searchTerm = `%${term}%`;
  return await query("SELECT * FROM produits WHERE designation LIKE ? OR reference LIKE ? LIMIT 10", [searchTerm, searchTerm]);
}

export async function addProduit(formData: FormData) {
  const reference = formData.get("reference") as string;
  const categorie = formData.get("categorie") as string;
  const designation = formData.get("designation") as string;
  const unite = formData.get("unite") as string;
  const prix_vente = parseFloat(formData.get("prix_vente") as string) || 0;

  if (!reference) return;

  await query(
    "INSERT INTO produits (reference, categorie, designation, unite, prix_vente) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE categorie=?, designation=?, unite=?, prix_vente=?",
    [reference, categorie, designation, unite, prix_vente, categorie, designation, unite, prix_vente]
  );
  revalidatePath("/admin/produits");
}

export async function updateProduit(oldRef: string, formData: FormData) {
  const reference = formData.get("reference") as string;
  const categorie = formData.get("categorie") as string;
  const designation = formData.get("designation") as string;
  const unite = formData.get("unite") as string;
  const prix_vente = parseFloat(formData.get("prix_vente") as string) || 0;

  if (!reference) return;

  await query(
    "UPDATE produits SET reference = ?, categorie = ?, designation = ?, unite = ?, prix_vente = ? WHERE reference = ?",
    [reference, categorie, designation, unite, prix_vente, oldRef]
  );
  revalidatePath("/admin/produits");
}

export async function deleteProduit(reference: string) {
  await query("DELETE FROM produits WHERE reference = ?", [reference]);
  revalidatePath("/admin/produits");
}

// --- PARAMETRES ---
export async function getParametres() {
  const rows: any = await query("SELECT * FROM parametres LIMIT 1");
  return rows[0];
}

export async function updateParametres(formData: FormData) {
  const nom = formData.get("nom") as string;
  const adresse = formData.get("adresse") as string;
  const telephone = formData.get("telephone") as string;
  const email = formData.get("email") as string;
  const siteweb = formData.get("siteweb") as string;
  const devise = formData.get("devise") as string;
  const tva = parseFloat(formData.get("tva") as string) || 20.00;
  
  await query(`
    UPDATE parametres SET 
    nom = ?, adresse = ?, telephone = ?, email = ?, siteweb = ?, devise = ?, tva = ?
  `, [nom, adresse, telephone, email, siteweb, devise, tva]);
  
  revalidatePath("/admin/parametres");
}

// --- FACTURES ---

// Auto-migrate: ensure document_type column exists
async function ensureDocumentType() {
  try { await query("ALTER TABLE factures ADD COLUMN document_type VARCHAR(20) DEFAULT 'facture'"); } catch (_) {}
  try { await query("ALTER TABLE factures ADD COLUMN statut VARCHAR(20) DEFAULT 'validee'"); } catch (_) {}
  try { await query("ALTER TABLE factures ADD COLUMN parent_id INT NULL"); } catch (_) {}
  try { await query("ALTER TABLE factures ADD COLUMN parent_type VARCHAR(20) NULL"); } catch (_) {}
}

export async function getFactures() {
  await ensureDocumentType();
  return await query(`
    SELECT f.*, c.nom as client_nom, c.adresse as client_adresse, c.telephone as client_telephone, c.email as client_email
    FROM factures f 
    JOIN clients c ON f.client_id = c.id 
    WHERE f.document_type = 'facture' OR f.document_type IS NULL
    ORDER BY f.created_at DESC
  `);
}

export async function getDocuments(type: string) {
  await ensureDocumentType();
  return await query(`
    SELECT f.*, c.nom as client_nom, c.adresse as client_adresse, c.telephone as client_telephone, c.email as client_email,
    EXISTS(SELECT 1 FROM factures child WHERE child.parent_id = f.id) as has_children,
    EXISTS(SELECT 1 FROM factures child WHERE child.parent_id = f.id AND child.statut = 'validee') as has_validated_children
    FROM factures f 
    JOIN clients c ON f.client_id = c.id 
    WHERE f.document_type = ?
    ORDER BY f.created_at DESC
  `, [type]);
}

export async function getFactureById(id: number) {
  const rows: any = await query(`
    SELECT f.*, c.nom as client_nom, c.adresse as client_adresse, c.telephone as client_telephone, c.email as client_email
    FROM factures f 
    JOIN clients c ON f.client_id = c.id 
    WHERE f.id = ?
  `, [id]);
  return rows[0] || null;
}

export async function getDocumentById(id: number) {
  return getFactureById(id);
}

export async function getFactureLignes(factureId: number) {
  return await query("SELECT * FROM facture_lignes WHERE facture_id = ?", [factureId]);
}

export async function getDocumentChildren(parentId: number) {
  await ensureDocumentType();
  return await query(`
    SELECT f.*, c.nom as client_nom 
    FROM factures f 
    JOIN clients c ON f.client_id = c.id 
    WHERE f.parent_id = ?
    ORDER BY f.created_at ASC
  `, [parentId]);
}

export async function getDeliveryProgress(bcId: number) {
  // Quantités commandées (agrégées par référence)
  const ordered: any = await query(
    "SELECT designation, produit_ref, prix_unitaire, SUM(quantite) as qty FROM facture_lignes WHERE facture_id = ? GROUP BY designation, produit_ref, prix_unitaire",
    [bcId]
  );
  
  // Récupérer les Bons de Livraison rattachés à ce BC
  const bls: any = await query(
    "SELECT id FROM factures WHERE parent_id = ? AND document_type = 'bon_livraison'",
    [bcId]
  );
  
  const blIds = bls.map((b: any) => b.id);
  let delivered: any[] = [];
  
  if (blIds.length > 0) {
    const placeholders = blIds.map(() => '?').join(',');
    delivered = await query(
      `SELECT designation, produit_ref, SUM(quantite) as qty FROM facture_lignes WHERE facture_id IN (${placeholders}) GROUP BY designation, produit_ref`,
      blIds
    ) as any[];
  }
  
  return ordered.map((o: any) => {
    const d = delivered.find((d: any) => 
      (d.produit_ref === o.produit_ref || (!d.produit_ref && !o.produit_ref)) && 
      d.designation === o.designation
    ) || { qty: 0 };
    return {
      designation: o.designation,
      produit_ref: o.produit_ref,
      prix_unitaire: Number(o.prix_unitaire),
      qty_ordered: Number(o.qty),
      qty_delivered: Number(d.qty),
      qty_remaining: Number(o.qty) - Number(d.qty),
    };
  });
}

export async function generateNumeroFacture() {
  return generateNumeroDocument('facture');
}

export async function generateNumeroDocument(type: string) {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  let prefixLetter = 'F';
  if (type === 'devis') prefixLetter = 'D';
  else if (type === 'bon_commande') prefixLetter = 'BC';
  else if (type === 'bon_livraison') prefixLetter = 'BL';

  const prefix = `${prefixLetter}${year}${month}`;
  const rows: any = await query(
    "SELECT numero FROM factures WHERE (document_type = ? OR (document_type IS NULL AND ? = 'facture')) AND numero LIKE ? ORDER BY numero DESC LIMIT 1", 
    [type, type, `${prefix}%`]
  );
  
  if (rows.length > 0) {
    const lastNum = rows[0].numero;
    const match = lastNum.match(/\d{4}$/);
    if (match) {
      const count = parseInt(match[0]);
      const newCount = String(count + 1).padStart(4, '0');
      return `${prefix}${newCount}`;
    }
  }
  
  return `${prefix}0001`;
}

export async function createFacture(factureData: any, lignes: any[]) {
  const { numero, date, client_id, total_ht, tva, total_ttc } = factureData;
  
  const res: any = await query(
    "INSERT INTO factures (numero, date, client_id, total_ht, tva, total_ttc) VALUES (?, ?, ?, ?, ?, ?)",
    [numero, date, client_id, total_ht, tva, total_ttc]
  );
  
  const facture_id = res.insertId;
  
  for (const ligne of lignes) {
    await query(
      "INSERT INTO facture_lignes (facture_id, produit_ref, designation, quantite, prix_unitaire, total_ligne) VALUES (?, ?, ?, ?, ?, ?)",
      [facture_id, ligne.produit_ref, ligne.designation, ligne.quantite, ligne.prix_unitaire, ligne.total_ligne]
    );
  }
  
  revalidatePath("/admin/factures");
  return facture_id;
}
