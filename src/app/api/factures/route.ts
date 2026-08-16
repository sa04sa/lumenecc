import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Ensure statut column exists in factures table
    try {
      await query("ALTER TABLE factures ADD COLUMN statut VARCHAR(20) DEFAULT 'validee'");
    } catch (e) {
      // Ignore error if column already exists
    }

    try {
      await query("ALTER TABLE factures ADD COLUMN document_type VARCHAR(20) DEFAULT 'facture'");
    } catch (e) {
      // Ignore error
    }

    const body = await req.json();
    const { numero, date, client_id, total_ht, tva, total_ttc, statut = "validee", document_type = "facture", parent_id = null, parent_type = null, methode_paiement = "Espèces", num_cheque = null, lignes } = body;

    try { await query("ALTER TABLE factures ADD COLUMN methode_paiement VARCHAR(50) DEFAULT 'Espèces'"); } catch (_) {}
    try { await query("ALTER TABLE factures ADD COLUMN num_cheque VARCHAR(50) NULL"); } catch (_) {}

    const res: any = await query(
      "INSERT INTO factures (numero, date, client_id, total_ht, tva, total_ttc, statut, document_type, parent_id, parent_type, methode_paiement, num_cheque) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [numero, date, client_id, total_ht, tva, total_ttc, statut, document_type, parent_id, parent_type, methode_paiement, num_cheque]
    );

    const facture_id = res.insertId;

    for (const ligne of lignes) {
      await query(
        "INSERT INTO facture_lignes (facture_id, produit_ref, designation, quantite, prix_unitaire, total_ligne) VALUES (?, ?, ?, ?, ?, ?)",
        [facture_id, ligne.produit_ref, ligne.designation, ligne.quantite, ligne.prix_unitaire, ligne.total_ligne]
      );
    }

    return NextResponse.json({ success: true, facture_id });
  } catch (err: any) {
    console.error("Facture create error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
