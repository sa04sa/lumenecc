"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

// --- CLIENTS ---
async function ensureIceColumn() {
  try { await query("ALTER TABLE clients ADD COLUMN ice VARCHAR(50) NULL"); } catch (_) {}
}

export async function getClients() {
  await ensureIceColumn();
  return await query("SELECT * FROM clients ORDER BY nom ASC");
}

export async function addClient(formData: FormData) {
  await ensureIceColumn();
  const nom = formData.get("nom") as string;
  const adresse = formData.get("adresse") as string;
  const telephone = formData.get("telephone") as string;
  const email = formData.get("email") as string;
  const ice = formData.get("ice") as string;
  
  await query("INSERT INTO clients (nom, adresse, telephone, email, ice) VALUES (?, ?, ?, ?, ?)", [nom, adresse, telephone, email, ice]);
  revalidatePath("/admin/clients");
}

export async function deleteClient(id: number) {
  await query("DELETE FROM clients WHERE id = ?", [id]);
  revalidatePath("/admin/clients");
}

export async function updateClient(id: number, formData: FormData) {
  await ensureIceColumn();
  const nom = formData.get("nom") as string;
  const adresse = formData.get("adresse") as string;
  const telephone = formData.get("telephone") as string;
  const email = formData.get("email") as string;
  const ice = formData.get("ice") as string;

  await query(
    "UPDATE clients SET nom = ?, adresse = ?, telephone = ?, email = ?, ice = ? WHERE id = ?",
    [nom, adresse, telephone, email, ice, id]
  );
  revalidatePath("/admin/clients");
}

async function ensureProduitColumns() {
  try { await query("ALTER TABLE produits ADD COLUMN prix_achat DECIMAL(10,2) DEFAULT 0"); } catch (_) {}
}

export async function getProduits() {
  await ensureProduitColumns();
  return await query("SELECT * FROM produits ORDER BY reference DESC");
}

export async function searchProduits(term: string) {
  await ensureProduitColumns();
  const searchTerm = `%${term}%`;
  return await query("SELECT * FROM produits WHERE designation LIKE ? OR reference LIKE ? LIMIT 10", [searchTerm, searchTerm]);
}

export async function addProduit(formData: FormData) {
  await ensureProduitColumns();
  const reference = formData.get("reference") as string;
  const categorie = formData.get("categorie") as string;
  const designation = formData.get("designation") as string;
  const unite = formData.get("unite") as string;
  const prix_achat = parseFloat(formData.get("prix_achat") as string) || 0;
  const prix_vente = parseFloat(formData.get("prix_vente") as string) || 0;

  if (!reference) return;

  await query(
    "INSERT INTO produits (reference, categorie, designation, unite, prix_achat, prix_vente) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE categorie=?, designation=?, unite=?, prix_achat=?, prix_vente=?",
    [reference, categorie, designation, unite, prix_achat, prix_vente, categorie, designation, unite, prix_achat, prix_vente]
  );
  revalidatePath("/admin/produits");
}

export async function updateProduit(oldRef: string, formData: FormData) {
  await ensureProduitColumns();
  const reference = formData.get("reference") as string;
  const categorie = formData.get("categorie") as string;
  const designation = formData.get("designation") as string;
  const unite = formData.get("unite") as string;
  const prix_achat = parseFloat(formData.get("prix_achat") as string) || 0;
  const prix_vente = parseFloat(formData.get("prix_vente") as string) || 0;

  if (!reference) return;

  await query(
    "UPDATE produits SET reference = ?, categorie = ?, designation = ?, unite = ?, prix_achat = ?, prix_vente = ? WHERE reference = ?",
    [reference, categorie, designation, unite, prix_achat, prix_vente, oldRef]
  );
  revalidatePath("/admin/produits");
}

export async function resetAndSeedProduits() {
  await ensureProduitColumns();
  await query("DELETE FROM produits");

  const items = [
    ['SMA-PRFE20', 'Eclairage', 'PROFILE ENC XT-600 3M 27/15 BLACK SMARA LIGHTING', 'Unite', 15.0000],
    ['1210010-B', 'Cable', 'CABLE AP 10 BLEU 100M', 'Rouleau 100M', 12.6000],
    ['1210010-R', 'Cable', 'CABLE AP 10 ROUGE 100M', 'Rouleau 100M', 12.7000],
    ['CRG6NB2100', 'Cable', 'CABLE COAXIAL RG6 100M NOIR AC', 'Rouleau 100M', 2.6698],
    ['MEC10910', 'Appareillage', 'MEC INTERRUPTEUR SA MLL NOIR LAP', 'Unite', 13.0000],
    ['MEC10911', 'Appareillage', 'MEC INTER DA MLL NOIR LAP', 'Unite', 28.1400],
    ['MEC10912', 'Appareillage', 'MEC INTER VA ET VIENT MLL NOIR LAP', 'Unite', 18.2700],
    ['MEC10927NR', 'Appareillage', 'MEC POUSSOIR INVERSEUR RIDEAUX MLL NOIR LAP', 'Unite', 38.6000],
    ['3901/10', 'Disjoncteur', 'DISJ UNIPOL 10A SECURIS 4.5KA 230/400V AC INGELEC', 'Unite', 16.2100],
    ['3901/16', 'Disjoncteur', 'DISJ UNIPOL 16A SECURIS 4.5KA 230/400V AC INGELEC', 'Unite', 16.2000],
    ['GT001-VMAX', 'Eclairage', 'DOUILLE GU10 V-MAX', 'Unite', 1.2000],
    ['MOTA-LGU10', 'Eclairage', 'LAMPE GU10 9W LED 6500K MOTA', 'Unite', 4.8000],
    ['AUX-GUIR08', 'Eclairage', 'GUIRLANDE 8MM WHITE AUXTON', 'Metre', 4.8000],
    ['71122030-986', 'Eclairage', 'PANEL ENCASTRE ROND 16W -6500K SIMON', 'Unite', 20.0000],
    ['52032*1.5', 'Cable', 'CABLE SV1V 2X1.5 CUIVRE MAM', 'Rouleau 100M', 4.3500],
    ['2604/02', 'Coffret', 'COFFRET DE FACADE 2A50/6DP MONO 80A', 'Unite', 390.0000],
    ['21002.5-B', 'Cable', 'CABLE U500V 2.5 BLEU IMACAB', 'Rouleau 100M', 3.9500],
    ['21002.5-R', 'Cable', 'CABLE U500V 2.5 ROUGE IMACAB', 'Rouleau 100M', 3.9500],
    ['121002-VJ', 'Cable', 'CABLE AP 2.5 VERT-JAUNE 100M', 'Rouleau 100M', 2.8000],
    ['1110010-B', 'Cable', 'CABLE U500V 10 BLEU ALAMIA', 'Rouleau 100M', 12.7000],
    ['1210010-VJ', 'Cable', 'CABLE AP 10 VERT-JAUNE 100M', 'Rouleau 100M', 12.6000],
    ['21001.5-R', 'Cable', 'CABLE U500V 1.5 ROUGE IMACAB', 'Rouleau 100M', 2.4000],
    ['31001.5-B', 'Cable', 'CABLE U500V 1.5 BLEU NEXANS', 'Rouleau 100M', 2.4200],
    ['21001.5-J', 'Cable', 'CABLE U500V 1.5 JAUNE IMACAB', 'Rouleau 100M', 2.4000],
    ['31001.5-N', 'Cable', 'CABLE U500V 1.5 NOIR NEXANS', 'Rouleau 100M', 2.4200],
    ['21001.5-B', 'Cable', 'CABLE U500V 1.5 BLEU IMACAB', 'Rouleau 100M', 2.4000],
    ['21001.5-N', 'Cable', 'CABLE U500V 1.5 NOIR IMACAB', 'Rouleau 100M', 2.4000],
    ['MEDIBOX', 'Coffret', 'COFFRET 2 FILS CARRE MEDIBOX ENCASTRE', 'Unite', 108.0000],
    ['532563', 'Coffret', 'COFFRET PANINTER FC 2A50+18D 80A MONO OGE', 'Unite', 1747.0000],
    ['053504', 'Coffret', 'COFFRET PANINTER VIDE ONEE OGE', 'Unite', 465.0000],
    ['LUXY-LMGU10', 'Eclairage', 'LAMPE SPOT LED GU10 9W 8000K LUXY', 'Unite', 5.0000],
    ['VM012', 'Eclairage', 'CADRE SPOT ROND ORIENT BLACK + BLACK V-MAX', 'Unite', 5.5000],
    ['LY2-NEX', 'Cable', 'CABLE LY 2P NEXANS', 'Rouleau 100M', 4.0000],
    ['BD-17WW', 'Eclairage', 'APPLIQUE LED 6+2W SIX YEUX IP65 WW GOLDEN', 'Unite', 50.0000],
    ['310010-R', 'Cable', 'CABLE U500V 10 ROUGE NEXANS', 'Rouleau 100M', 17.8000],
    ['310010B-L', 'Cable', 'CABLE U500V 10 BLEU NEXANS LONG', 'Rouleau 100M', 17.0000],
    ['71121030-986', 'Eclairage', 'PANEL ENCASTRE ROND 12W -6500K SIMON', 'Unite', 980.0000],
    ['52600062', 'Interphonie', 'K.INTERPH 3P-AGT3K200A03SF 8K40CA-012', 'Unite', 1.5000],
    ['51032*1.5-CCA', 'Cable', 'CABLE SV1V 2X1.5 GRIS CCA ULTRA', 'Rouleau 100M', 7.0000],
    ['SMA-FG-WIR', 'Eclairage', 'FICHE GUIRLANDE WIRELESS SMARA', 'Unite', 0.0000],
    ['GY-200', 'Eclairage', 'HUBLOT APPARENT 20W ROND + DETECTEUR GOLDEN', 'Unite', 60.0000],
    ['61054*16', 'Cable', 'CABLE RVFV 4*16 (SYN)', 'Rouleau 100M', 116.0000],
    ['CADM0117', 'Appareillage', 'CADRE 01 POSTE NOIR MILL', 'Unite', 3.0900],
    ['CADM02H17', 'Appareillage', 'MULTICADRE 2 POSTES HORIZ NOIR MILL', 'Unite', 8.3800],
    ['CADM03H17', 'Appareillage', 'MULTICADRE 03 HORIZONTAL NOIR MILL', 'Unite', 11.3600],
  ];

  for (const item of items) {
    const [ref, cat, des, un, pa] = item as [string, string, string, string, number];
    const pv = pa > 0 ? Number((pa * 1.35).toFixed(2)) : 10.00;
    await query(
      "INSERT INTO produits (reference, categorie, designation, unite, prix_achat, prix_vente) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE categorie=?, designation=?, unite=?, prix_achat=?, prix_vente=?",
      [ref, cat, des, un, pa, pv, cat, des, un, pa, pv]
    );
  }

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
  // Auto-migrate new columns if they don't exist
  try { await query("ALTER TABLE parametres ADD COLUMN rc VARCHAR(100) NULL"); } catch (_) {}
  try { await query("ALTER TABLE parametres ADD COLUMN patente VARCHAR(100) NULL"); } catch (_) {}
  try { await query("ALTER TABLE parametres ADD COLUMN if_taxe VARCHAR(100) NULL"); } catch (_) {}
  try { await query("ALTER TABLE parametres ADD COLUMN cnss VARCHAR(100) NULL"); } catch (_) {}
  try { await query("ALTER TABLE parametres ADD COLUMN ice VARCHAR(100) NULL"); } catch (_) {}
  try { await query("ALTER TABLE parametres ADD COLUMN fax VARCHAR(50) NULL"); } catch (_) {}

  const nom       = formData.get("nom") as string;
  const adresse   = formData.get("adresse") as string;
  const telephone = formData.get("telephone") as string;
  const fax       = formData.get("fax") as string;
  const email     = formData.get("email") as string;
  const siteweb   = formData.get("siteweb") as string;
  const devise    = formData.get("devise") as string;
  const tva       = parseFloat(formData.get("tva") as string) || 20.00;
  const rc        = formData.get("rc") as string;
  const patente   = formData.get("patente") as string;
  const if_taxe   = formData.get("if_taxe") as string;
  const cnss      = formData.get("cnss") as string;
  const ice       = formData.get("ice") as string;
  
  await query(`
    UPDATE parametres SET 
    nom = ?, adresse = ?, telephone = ?, fax = ?, email = ?, siteweb = ?, devise = ?, tva = ?,
    rc = ?, patente = ?, if_taxe = ?, cnss = ?, ice = ?
  `, [nom, adresse, telephone, fax, email, siteweb, devise, tva, rc, patente, if_taxe, cnss, ice]);
  
  revalidatePath("/admin/parametres");
}

// --- FACTURES ---

// Auto-migrate: ensure document_type column exists
async function ensureDocumentType() {
  try { await query("ALTER TABLE factures ADD COLUMN document_type VARCHAR(20) DEFAULT 'facture'"); } catch (_) {}
  try { await query("ALTER TABLE factures ADD COLUMN statut VARCHAR(20) DEFAULT 'validee'"); } catch (_) {}
  try { await query("ALTER TABLE factures ADD COLUMN parent_id INT NULL"); } catch (_) {}
  try { await query("ALTER TABLE factures ADD COLUMN parent_type VARCHAR(20) NULL"); } catch (_) {}
  try { await query("ALTER TABLE factures ADD COLUMN methode_paiement VARCHAR(50) DEFAULT 'Espèces'"); } catch (_) {}
  try { await query("ALTER TABLE factures ADD COLUMN num_cheque VARCHAR(50) NULL"); } catch (_) {}
  try { await query("ALTER TABLE facture_lignes ADD COLUMN prix_achat DECIMAL(10,2) DEFAULT 0"); } catch (_) {}
}

export async function getFactures() {
  await ensureDocumentType();
  return await query(`
    SELECT f.*, c.nom as client_nom, c.adresse as client_adresse, c.telephone as client_telephone, c.email as client_email, c.ice as client_ice,
    COALESCE(
      (SELECT SUM(fl.quantite * COALESCE(p.prix_achat, 0)) 
       FROM facture_lignes fl 
       LEFT JOIN produits p ON fl.produit_ref = p.reference 
       WHERE fl.facture_id = f.id), 0
    ) as total_achat
    FROM factures f 
    JOIN clients c ON f.client_id = c.id 
    WHERE f.document_type = 'facture' OR f.document_type IS NULL
    ORDER BY f.created_at DESC
  `);
}

export async function getDocuments(type: string) {
  await ensureDocumentType();
  return await query(`
    SELECT f.*, c.nom as client_nom, c.adresse as client_adresse, c.telephone as client_telephone, c.email as client_email, c.ice as client_ice,
    COALESCE(
      (SELECT SUM(fl.quantite * COALESCE(p.prix_achat, 0)) 
       FROM facture_lignes fl 
       LEFT JOIN produits p ON fl.produit_ref = p.reference 
       WHERE fl.facture_id = f.id), 0
    ) as total_achat,
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
