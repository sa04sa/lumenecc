"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, Printer, Loader2 } from "lucide-react";
import { getFactureLignes } from "@/app/admin/actions";

// ── Palette minimaliste ──────────────────────────────────────────────────────
const C = {
  BLACK:  [10, 10, 10]   as [number,number,number],
  DARK:   [30, 30, 30]   as [number,number,number],
  GRAY1:  [80, 80, 80]   as [number,number,number],   // texte secondaire
  GRAY2:  [140,140,140]  as [number,number,number],   // labels
  GRAY3:  [200,200,200]  as [number,number,number],   // lignes légères
  GRAY4:  [240,240,240]  as [number,number,number],   // fonds alternés
  WHITE:  [255,255,255]  as [number,number,number],
  GOLD:   [200,155,0]    as [number,number,number],   // or discret (1 seul usage)
};

export default function PDFButton({ facture, parametres }: any) {
  const [loading, setLoading] = useState(false);

  const generatePDF = async (action: "download" | "print" = "download") => {
    try {
      setLoading(true);
      const lignes = await getFactureLignes(facture.id) as any[];
      const doc    = new jsPDF({ unit: "mm", format: "a4" });
      const isDraft = facture.statut === "brouillon";
      const W = doc.internal.pageSize.width;   // 210
      const H = doc.internal.pageSize.height;  // 297
      const ML = 16, MR = 16;                  // marges left / right

      // ── Charger le logo ─────────────────────────────────────────────
      const img = new Image();
      img.src = "/logo.png";
      await new Promise(r => { img.onload = r; img.onerror = r; });

      // ── Watermark brouillon ─────────────────────────────────────────
      if (isDraft) {
        doc.saveGraphicsState();
        try { (doc as any).setGState(new (doc as any).GState({ opacity: 0.05 })); } catch (_) {}
        doc.setFontSize(72);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C.GRAY1);
        doc.text("BROUILLON", W / 2, H / 2, { align: "center", angle: 45 });
        doc.restoreGraphicsState();
      }

      // ════════════════════════════════════════════════════════════════
      //  HEADER  —  logo gauche | titre + numéro droite
      // ════════════════════════════════════════════════════════════════
      const HDR_TOP = 14, HDR_BOT = 46;

      // Ligne fine dorée tout en haut (signature de marque, discrète)
      doc.setFillColor(...C.GOLD);
      doc.rect(0, 0, W, 0.8, "F");

      // Logo
      if (img.width > 0 && img.height > 0) {
        const maxW = 44, maxH = 22;
        const ratio = Math.min(maxW / img.width, maxH / img.height);
        doc.addImage(img, "PNG", ML, HDR_TOP, img.width * ratio, img.height * ratio);
      } else {
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C.BLACK);
        doc.text(parametres?.nom || "LUMENEC", ML, HDR_TOP + 12);
      }

      // Titre document (à droite)
      const docTypeMap: Record<string, string> = {
        facture:       "FACTURE",
        devis:         "DEVIS",
        bon_commande:  "BON DE COMMANDE",
        bon_livraison: "BON DE LIVRAISON",
      };
      const docTitle = isDraft ? "BROUILLON" : (docTypeMap[facture.document_type] || "FACTURE");
      const dateStr  = new Date(facture.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(...C.BLACK);
      doc.text(docTitle, W - MR, HDR_TOP + 8, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.GRAY1);
      doc.text(`N°  ${facture.numero}`, W - MR, HDR_TOP + 15, { align: "right" });
      doc.text(`Date :  ${dateStr}`,     W - MR, HDR_TOP + 20.5, { align: "right" });
      if (facture.document_type === "devis") {
        doc.setTextColor(...C.GRAY2);
        doc.text("Valable 30 jours",      W - MR, HDR_TOP + 26, { align: "right" });
      }

      // Ligne de séparation sous le header
      doc.setDrawColor(...C.GRAY3);
      doc.setLineWidth(0.4);
      doc.line(ML, HDR_BOT, W - MR, HDR_BOT);

      // ════════════════════════════════════════════════════════════════
      //  BLOC ÉMETTEUR + CLIENT (côte à côte)
      // ════════════════════════════════════════════════════════════════
      const INFO_Y = HDR_BOT + 8;
      const COL_R  = W / 2 + 4;           // début colonne cliente

      // ── Émetteur ──
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.GRAY2);
      doc.text("DE", ML, INFO_Y);

      let ey = INFO_Y + 5;
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.BLACK);
      doc.text(parametres?.nom || "LUMENEC", ML, ey);

      ey += 5;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.GRAY1);
      if (parametres?.adresse) {
        const ls = doc.splitTextToSize(parametres.adresse, 80);
        doc.text(ls, ML, ey);
        ey += ls.length * 4.2;
      }
      if (parametres?.telephone) { doc.text(`Tél : ${parametres.telephone}`, ML, ey); ey += 4.2; }
      if (parametres?.email)     { doc.text(parametres.email, ML, ey); ey += 4.2; }
      if (parametres?.siteweb)   { doc.text(parametres.siteweb, ML, ey); }

      // ── Client ──
      const clientLabel = facture.document_type === "devis" ? "ADRESSÉ À" : "FACTURER À";
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.GRAY2);
      doc.text(clientLabel, COL_R, INFO_Y);

      let cy = INFO_Y + 5;
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.BLACK);
      doc.text(facture.client_nom || "—", COL_R, cy);

      cy += 5;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.GRAY1);
      if (facture.client_adresse) {
        const ls = doc.splitTextToSize(facture.client_adresse, 80);
        doc.text(ls, COL_R, cy);
        cy += ls.length * 4.2;
      }
      if (facture.client_telephone) { doc.text(`Tél : ${facture.client_telephone}`, COL_R, cy); cy += 4.2; }
      if (facture.client_email)     { doc.text(facture.client_email, COL_R, cy); }

      // ════════════════════════════════════════════════════════════════
      //  TABLEAU PRODUITS
      // ════════════════════════════════════════════════════════════════
      const isBL     = facture.document_type === "bon_livraison";
      const tableY   = Math.max(ey, cy) + 12;
      const devise   = parametres?.devise || "MAD";

      const head = isBL
        ? [["Référence", "Désignation", "Qté"]]
        : [["Référence", "Désignation", "Qté", `P.U HT (${devise})`, `Total HT (${devise})`]];

      const body = lignes.map(l => {
        const row: any[] = [
          l.produit_ref || "—",
          l.designation || "—",
          { content: String(l.quantite), styles: { halign: "center" as const } },
        ];
        if (!isBL) {
          row.push({ content: Number(l.prix_unitaire).toFixed(2), styles: { halign: "right" as const } });
          row.push({ content: Number(l.total_ligne).toFixed(2),   styles: { halign: "right" as const, fontStyle: "bold" as const } });
        }
        return row;
      });

      const colStyles: any = {
        0: { cellWidth: 30 },
        1: { cellWidth: "auto" },
        2: { cellWidth: 14, halign: "center" },
      };
      if (!isBL) {
        colStyles[3] = { cellWidth: 30, halign: "right" };
        colStyles[4] = { cellWidth: 35, halign: "right", fontStyle: "bold" };
      }

      autoTable(doc, {
        startY: tableY,
        head,
        body,
        theme: "plain",
        headStyles: {
          fillColor:   C.DARK,
          textColor:   C.WHITE,
          fontStyle:   "bold",
          fontSize:    8,
          cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
        },
        bodyStyles: {
          fontSize:    8.5,
          textColor:   C.DARK,
          cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
          lineColor:   C.GRAY4,
          lineWidth:   0.2,
        },
        alternateRowStyles: { fillColor: [247, 247, 247] },
        columnStyles: colStyles,
        margin: { left: ML, right: MR },
        // Ligne dorée fine sous l'entête
        didDrawCell: (data: any) => {
          if (data.section === "head" && data.row.index === 0) {
            doc.setFillColor(...C.GOLD);
            doc.rect(data.cell.x, data.cell.y + data.cell.height - 0.5, data.cell.width, 0.5, "F");
          }
        },
      });

      const finalY = (doc as any).lastAutoTable.finalY ?? tableY + 20;

      // ════════════════════════════════════════════════════════════════
      //  TOTAUX  (absents pour BL)
      // ════════════════════════════════════════════════════════════════
      if (!isBL) {
        const TW  = 74;                       // largeur bloc totaux
        const TX  = W - MR - TW;             // x gauche
        let   ty  = finalY + 10;

        const row = (label: string, value: string, bold = false) => {
          doc.setFont("helvetica", bold ? "bold" : "normal");
          doc.setFontSize(9);
          doc.setTextColor(...C.GRAY1);
          doc.text(label, TX, ty);
          doc.setTextColor(...(bold ? C.BLACK : C.DARK));
          doc.text(value, W - MR, ty, { align: "right" });
          ty += 6;
        };

        // Séparateur
        doc.setDrawColor(...C.GRAY3);
        doc.setLineWidth(0.3);
        doc.line(TX, ty - 4, W - MR, ty - 4);

        row("Montant HT",
            `${Number(facture.total_ht).toFixed(2)} ${devise}`);
        row(`TVA (${parametres?.tva || 20}%)`,
            `${Number(facture.tva).toFixed(2)} ${devise}`);

        // Ligne avant TTC
        doc.setDrawColor(...C.GRAY3);
        doc.line(TX, ty - 2, W - MR, ty - 2);
        ty += 2;

        // Fond sombre pour le total TTC
        doc.setFillColor(...C.DARK);
        doc.rect(TX - 2, ty - 1, TW + 4, 13, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...C.WHITE);
        doc.text("Total TTC", TX + 2, ty + 7);
        doc.text(`${Number(facture.total_ttc).toFixed(2)} ${devise}`, W - MR - 2, ty + 7, { align: "right" });
      }

      // ════════════════════════════════════════════════════════════════
      //  FOOTER
      // ════════════════════════════════════════════════════════════════
      // Ligne dorée fine en pied de page
      doc.setFillColor(...C.GOLD);
      doc.rect(0, H - 16, W, 0.5, "F");

      // Bande gris très clair
      doc.setFillColor(250, 250, 250);
      doc.rect(0, H - 15.5, W, 15.5, "F");

      const footerParts = [
        parametres?.nom || "LUMENEC",
        parametres?.adresse || "",
        parametres?.telephone ? `Tél : ${parametres.telephone}` : "",
        parametres?.email || "",
        parametres?.siteweb || "",
      ].filter(Boolean);

      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.GRAY2);
      doc.text(footerParts.join("  ·  "), W / 2, H - 8, { align: "center", maxWidth: W - 28 });

      // ── Sortie ─────────────────────────────────────────────────────
      const typeMap: Record<string, string> = {
        facture: "Facture", devis: "Devis",
        bon_commande: "Bon_de_Commande", bon_livraison: "Bon_de_Livraison",
      };
      const prefix = isDraft ? "BROUILLON" : (typeMap[facture.document_type] || "Facture");

      if (action === "download") {
        doc.save(`${prefix}_${facture.numero}.pdf`);
      } else {
        window.open(doc.output("bloburl"), "_blank");
      }
    } catch (err) {
      console.error("Erreur génération PDF:", err);
      alert("Une erreur est survenue lors de la génération du PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => generatePDF("download")}
        disabled={loading}
        className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-all cursor-pointer"
        title="Télécharger PDF"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      </button>
      <button
        onClick={() => generatePDF("print")}
        disabled={loading}
        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-all cursor-pointer"
        title="Aperçu / Imprimer"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
      </button>
    </div>
  );
}
