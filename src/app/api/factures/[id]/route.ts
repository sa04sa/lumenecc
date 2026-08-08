import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { date, client_id, total_ht, tva, total_ttc, statut, document_type = "facture", parent_id = null, parent_type = null, lignes } = body;

    // Verify if it's not already validated
    const currentFacture: any = await query("SELECT statut FROM factures WHERE id = ?", [id]);
    if (currentFacture.length === 0) {
      return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
    }
    
    // Update facture
    await query(
      "UPDATE factures SET date = ?, client_id = ?, total_ht = ?, tva = ?, total_ttc = ?, statut = ?, document_type = ?, parent_id = ?, parent_type = ? WHERE id = ?",
      [date, client_id, total_ht, tva, total_ttc, statut, document_type, parent_id, parent_type, id]
    );

    // Delete old lines
    await query("DELETE FROM facture_lignes WHERE facture_id = ?", [id]);

    // Insert new lines
    for (const ligne of lignes) {
      await query(
        "INSERT INTO facture_lignes (facture_id, produit_ref, designation, quantite, prix_unitaire, total_ligne) VALUES (?, ?, ?, ?, ?, ?)",
        [id, ligne.produit_ref, ligne.designation, ligne.quantite, ligne.prix_unitaire, ligne.total_ligne]
      );
    }

    return NextResponse.json({ success: true, facture_id: id });
  } catch (err: any) {
    console.error("Facture update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
