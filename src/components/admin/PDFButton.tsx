"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, Printer, Loader2 } from "lucide-react";
import { getFactureLignes } from "@/app/admin/actions";

// ── Palette de couleurs ──────────────────────────────────────────────────────
const C = {
  BLACK:  [15, 23, 42]   as [number,number,number],   // noir/ardoise foncé
  DARK:   [30, 30, 30]   as [number,number,number],
  GRAY1:  [80, 80, 80]   as [number,number,number],   // texte secondaire
  GRAY2:  [140,140,140]  as [number,number,number],   // labels
  GRAY3:  [200,200,200]  as [number,number,number],   // lignes légères
  GRAY4:  [240,240,240]  as [number,number,number],   // fonds alternés
  WHITE:  [255,255,255]  as [number,number,number],
  GOLD:   [200,155,0]    as [number,number,number],   // or discret
};

// ── Convertisseur nombre en lettres (français) ──────────────────────────────
function nombreEnLettres(n: number): string {
  const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
    "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
  const tens  = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];

  if (n === 0) return "zéro";
  if (n < 0)   return "moins " + nombreEnLettres(-n);

  const convert = (num: number): string => {
    if (num === 0) return "";
    if (num < 20)  return units[num];
    if (num < 100) {
      const t = Math.floor(num / 10);
      const u = num % 10;
      if (t === 7) return "soixante-" + units[10 + u];
      if (t === 9) return "quatre-vingt-" + (u > 0 ? units[u] : "");
      return tens[t] + (u === 1 && t !== 8 ? "-et-un" : u > 0 ? "-" + units[u] : (t === 8 ? "s" : ""));
    }
    if (num < 1000) {
      const h = Math.floor(num / 100);
      const r = num % 100;
      return (h === 1 ? "cent" : units[h] + " cent") + (r > 0 ? " " + convert(r) : (h > 1 ? "s" : ""));
    }
    if (num < 1000000) {
      const m = Math.floor(num / 1000);
      const r = num % 1000;
      return (m === 1 ? "mille" : convert(m) + " mille") + (r > 0 ? " " + convert(r) : "");
    }
    return num.toString();
  };

  const entier   = Math.floor(n);
  const centimes = Math.round((n - entier) * 100);
  let result = convert(entier) + " dirhams";
  if (centimes > 0) result += " et " + convert(centimes) + " centimes";
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export default function PDFButton({ facture, parametres }: any) {
  const [loading, setLoading] = useState(false);

  const generatePDF = async (action: "download" | "print" = "download") => {
    try {
      setLoading(true);
      const lignes  = await getFactureLignes(facture.id) as any[];
      const doc     = new jsPDF({ unit: "mm", format: "a4" });
      const isDraft = facture.statut === "brouillon";
      const W  = doc.internal.pageSize.width;   // 210
      const H  = doc.internal.pageSize.height;  // 297
      const ML = 12, MR = 12;
      const docType = facture.document_type || "facture";
      const isFacture = docType === "facture";
      const isBL      = docType === "bon_livraison";
      const devise    = parametres?.devise || "MAD";

      const docTypeMap: Record<string, string> = {
        facture:       "FACTURE",
        devis:         "DEVIS",
        bon_commande:  "BON DE COMMANDE",
        bon_livraison: "BON DE LIVRAISON",
      };
      const docTitle = docTypeMap[docType] || "FACTURE";
      const dateStr  = new Date(facture.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

      // Charger le logo
      const img = new Image();
      img.src = "/logo_lumenec-without-background.png";
      await new Promise(r => { img.onload = r; img.onerror = r; });

      // Watermark logo (fond)
      if (img.width > 0 && img.height > 0) {
        doc.saveGraphicsState();
        try { (doc as any).setGState(new (doc as any).GState({ opacity: 0.12 })); } catch (_) {}
        const wW = 120, wH = (img.height / img.width) * wW;
        doc.addImage(img, "PNG", (W - wW) / 2, (H - wH) / 2, wW, wH);
        doc.restoreGraphicsState();
      }

      // Watermark brouillon
      if (isDraft) {
        doc.saveGraphicsState();
        try { (doc as any).setGState(new (doc as any).GState({ opacity: 0.07 })); } catch (_) {}
        doc.setFontSize(60);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(200, 30, 30);
        doc.text("BROUILLON", W / 2, H / 2, { align: "center", angle: 45 });
        doc.restoreGraphicsState();
      }

      // =========================================================================
      //  DESIGN FACTURE (Style Marocain dédié aux Factures uniquement)
      // =========================================================================
      if (isFacture) {
        // ── DIMENSIONS FIXES (aucun chevauchement possible) ──
        const HDR_H  = 52;   // hauteur totale de l'en-tête
        const midX   = W / 2;
        const GREY_HEADER: [number, number, number] = C.BLACK;
        const GREY_BORDER: [number, number, number] = [170, 175, 185];

        // ── FOND EN-TÊTE ──
        // Fond transparent (blanc) comme les autres documents
        // Ligne inférieure
        doc.setFillColor(...GREY_HEADER);
        doc.rect(0, HDR_H, W, 1, "F");

        // ── COLONNE GAUCHE : Adresse + Identifiants (x fixe = ML, y = 7 à 48) ──
        const COL_L_X = ML;
        const COL_L_W = 68; // largeur max colonne gauche
        let ly = 7;
        doc.setFontSize(6.5);

        if (parametres?.adresse) {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...C.GRAY1);
          const addrLines = doc.splitTextToSize(parametres.adresse, COL_L_W);
          doc.text(addrLines, COL_L_X, ly);
          ly += addrLines.length * 3.6;
        }

        const legalItems = [
          parametres?.rc      ? ["R.C.",     parametres.rc]      : null,
          parametres?.if_taxe ? ["I.F.",     parametres.if_taxe] : null,
          parametres?.cnss    ? ["C.N.S.S.", parametres.cnss]    : null,
          parametres?.ice     ? ["ICE",      parametres.ice]     : null,
        ].filter(Boolean) as [string, string][];

        legalItems.forEach(([label, val]) => {
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...C.BLACK);
          doc.text(`${label} :`, COL_L_X, ly);
          const lw2 = doc.getTextWidth(`${label} : `);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...C.GRAY1);
          doc.text(String(val), COL_L_X + lw2, ly);
          ly += 3.6;
        });

        // ── COLONNE DROITE : Contacts & Titre (alignés à droite) ──
        const COL_R_X = W - MR;

        // Titre FACTURE (sans fond, texte pur) en HAUT À DROITE
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(...C.BLACK);
        doc.text("FACTURE", COL_R_X, 15, { align: "right" });

        // Numéro, Date, Règlement (en dessous du titre FACTURE)
        let ry = 22;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...C.BLACK);
        doc.text(`N° ${facture.numero}`, COL_R_X, ry, { align: "right" });
        ry += 4;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...C.GRAY1);
        doc.text(`Date : ${dateStr}`, COL_R_X, ry, { align: "right" });
        ry += 4;
        if (facture.methode_paiement) {
          const reglStr = facture.methode_paiement + (facture.num_cheque ? ` - N° ${facture.num_cheque}` : "");
          doc.text(`Règlement : ${reglStr}`, COL_R_X, ry, { align: "right" });
        }

        // ── COLONNE CENTRE : Logo + Nom société ──
        const logoMaxW = 64, logoMaxH = 32;
        let logoBottomY = 5;
        if (img.width > 0 && img.height > 0) {
          const ratio = Math.min(logoMaxW / img.width, logoMaxH / img.height);
          const lw = img.width * ratio, lh = img.height * ratio;
          doc.addImage(img, "PNG", midX - lw / 2, 4, lw, lh);
          logoBottomY = 4 + lh;
        }

        // Nom de l'entreprise sous le logo
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(...C.BLACK);
        doc.text((parametres?.nom || "LUMENEC").toUpperCase(), midX, logoBottomY + 5, { align: "center" });

        // ── LIGNE D'ACTIVITÉ centrée en bas de l'en-tête ──
        doc.setFont("helvetica", "normal");
        doc.setFontSize(5.8);
        doc.setTextColor(100, 105, 115);
        doc.text(
          "INSTALLATION, VENTE ET ACHAT DE MATÉRIEL ÉLECTRIQUE ET TRAVAUX DIVERS",
          midX, logoBottomY + 9, { align: "center" }
        );

        // ── SOUS-HEADER : Contacts (Gauche) | Cadre Client (Droite) ──
        const SH_Y = HDR_H + 7;

        // Contacts à gauche
        doc.setFontSize(7.5);
        let shY = SH_Y;
        const contactItems = [
          parametres?.telephone ? `Tél : ${parametres.telephone}` : null,
          parametres?.fax       ? `Fax : ${parametres.fax}`       : null,
          parametres?.email     ? `Email : ${parametres.email}`   : null,
          parametres?.siteweb   ? `Web : ${parametres.siteweb}`   : null,
        ].filter(Boolean) as string[];

        contactItems.forEach(line => {
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...C.BLACK);
          const parts = line.split(" : ");
          if (parts.length === 2) {
             doc.text(`${parts[0]} :`, ML, shY);
             doc.setFont("helvetica", "normal");
             doc.setTextColor(...C.GRAY1);
             doc.text(parts[1], ML + 12, shY);
          } else {
             doc.setFont("helvetica", "normal");
             doc.setTextColor(...C.GRAY1);
             doc.text(line, ML, shY);
          }
          shY += 5;
        });

        // Cadre client (droite)
        const clientBoxX = midX + 4;
        const clientBoxW = W - clientBoxX - MR;
        const clientBoxY = SH_Y - 4;
        const clientBoxH = 26;

        doc.setDrawColor(...GREY_BORDER);
        doc.setLineWidth(0.4);
        doc.rect(clientBoxX, clientBoxY, clientBoxW, clientBoxH);
        doc.setFillColor(...GREY_HEADER);
        doc.rect(clientBoxX, clientBoxY, clientBoxW, 5.5, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(...C.WHITE);
        doc.text("FACTURER À", clientBoxX + clientBoxW / 2, clientBoxY + 3.6, { align: "center" });

        let cly = clientBoxY + 9;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...C.BLACK);
        doc.text(facture.client_nom || "—", clientBoxX + 3, cly);
        cly += 4.5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...C.GRAY1);
        if (facture.client_telephone) {
          doc.text(`Tél : ${facture.client_telephone}`, clientBoxX + 3, cly);
          cly += 3.8;
        }
        if (facture.client_ice) {
          doc.text(`ICE : ${facture.client_ice}`, clientBoxX + 3, cly);
        }

        // ── TABLEAU PRODUITS ──
        const tableY = clientBoxY + clientBoxH + 6;
        const head = [["Référence", "Désignation", "Qté", "PRIX H.T.", "Montant"]];
        const body = lignes.map(l => [
          l.produit_ref || "—",
          l.designation || "—",
          { content: String(l.quantite), styles: { halign: "center" as const } },
          { content: Number(l.prix_unitaire).toFixed(2), styles: { halign: "right" as const } },
          { content: Number(l.total_ligne).toFixed(2), styles: { halign: "right" as const, fontStyle: "bold" as const } },
        ]);

        autoTable(doc, {
          startY: tableY,
          head,
          body,
          theme: "grid",
          headStyles: {
            fillColor:   GREY_HEADER,
            textColor:   C.WHITE,
            fontStyle:   "bold",
            fontSize:    8,
            halign:      "center",
            cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
          },
          bodyStyles: {
            fontSize:    8,
            textColor:   C.BLACK,
            cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
            lineColor:   [215, 220, 230],
            lineWidth:   0.3,
          },
          alternateRowStyles: { fillColor: [248, 249, 251] },
          columnStyles: {
            0: { cellWidth: 26 },
            1: { cellWidth: "auto" },
            2: { cellWidth: 14, halign: "center" },
            3: { cellWidth: 30, halign: "right" },
            4: { cellWidth: 28, halign: "right" },
          },
          margin: { left: ML, right: MR },
        });

        const finalY = (doc as any).lastAutoTable.finalY ?? tableY + 30;

        // ── TOTAUX : 3 colonnes ──
        const totY = finalY + 5;
        const totH = 11;
        const cols = [
          { label: "MONTANT H.T.", val: `${Number(facture.total_ht).toFixed(2)} ${devise}` },
          { label: `T.V.A. ${parametres?.tva || 20} %`, val: `${Number(facture.tva).toFixed(2)} ${devise}` },
          { label: "TOTAL T.T.C.", val: `${Number(facture.total_ttc).toFixed(2)} ${devise}` },
        ];
        const colW = (W - ML - MR) / cols.length;

        cols.forEach((col, i) => {
          const cx = ML + i * colW;
          // Fond label
          doc.setFillColor(...GREY_HEADER);
          doc.rect(cx, totY, colW, totH / 2, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(6.5);
          doc.setTextColor(...C.WHITE);
          doc.text(col.label, cx + colW / 2, totY + 3.5, { align: "center" });
          // Fond valeur
          doc.setFillColor(...C.WHITE);
          doc.setDrawColor(...GREY_BORDER);
          doc.setLineWidth(0.4);
          doc.rect(cx, totY + totH / 2, colW, totH / 2);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(...C.BLACK);
          doc.text(col.val, cx + colW / 2, totY + totH - 1.8, { align: "center" });
        });

        // ── SOMME EN LETTRES ──
        const lettresY = totY + totH + 6;
        doc.setFillColor(245, 246, 248);
        doc.setDrawColor(...GREY_BORDER);
        doc.setLineWidth(0.3);
        doc.rect(ML, lettresY - 3.5, W - ML - MR, 8.5);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(...C.BLACK);
        doc.text("Arrêtée la présente facture à la somme de :", ML + 2, lettresY + 1);
        doc.setFont("helvetica", "normal");
        const letText = nombreEnLettres(Number(facture.total_ttc));
        doc.text(letText, ML + 66, lettresY + 1, { maxWidth: W - ML - MR - 70 });

      } else {
        // =========================================================================
        //  DESIGN STANDARD MINIMALISTE (Devis, Bon de Commande, Bon de Livraison)
        // =========================================================================
        const HDR_TOP = 14, HDR_BOT = 44;

        // Trait doré élégant en haut
        doc.setFillColor(...C.GOLD);
        doc.rect(0, 0, W, 0.8, "F");

        // Logo à gauche
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

        // Titre à droite
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(...C.BLACK);
        doc.text(docTitle, W - MR, HDR_TOP + 8, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...C.GRAY1);
        doc.text(`N°  ${facture.numero}`, W - MR, HDR_TOP + 15, { align: "right" });
        doc.text(`Date :  ${dateStr}`,     W - MR, HDR_TOP + 20.5, { align: "right" });
        if (docType === "devis") {
          doc.setTextColor(...C.GRAY2);
          doc.text("Valable 30 jours", W - MR, HDR_TOP + 26, { align: "right" });
        }

        // Séparateur
        doc.setDrawColor(...C.GRAY3);
        doc.setLineWidth(0.4);
        doc.line(ML, HDR_BOT, W - MR, HDR_BOT);

        // Blocs Émetteur & Client
        const INFO_Y = HDR_BOT + 8;
        const COL_R  = W / 2 + 4;

        // Émetteur
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
        if (parametres?.email)     { doc.text(parametres.email, ML, ey); }

        // Client
        const clientLabel = docType === "devis" ? "ADRESSÉ À" : "CLIENT";
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
        
        if (facture.client_telephone) { 
          doc.text(`Tél : ${facture.client_telephone}`, COL_R, cy); 
          cy += 4.2; 
        }
        if (facture.client_ice) { 
          doc.text(`ICE : ${facture.client_ice}`, COL_R, cy); 
        }

        // Tableau Produit Standard
        const hidePrices = docType === "bon_commande";
        const tableY = Math.max(ey, cy) + 10;
        const head = hidePrices
          ? [["Référence", "Désignation", "Quantité"]]
          : [["Référence", "Désignation", "Quantité", "PRIX H.T.", "Montant"]];

        const body = lignes.map(l => {
          const row: any[] = [
            l.produit_ref || "—",
            l.designation || "—",
            { content: String(l.quantite), styles: { halign: "center" as const } },
          ];
          if (!hidePrices) {
            row.push({ content: Number(l.prix_unitaire).toFixed(2), styles: { halign: "right" as const } });
            row.push({ content: Number(l.total_ligne).toFixed(2),   styles: { halign: "right" as const, fontStyle: "bold" as const } });
          }
          return row;
        });

        const colStyles: any = {
          0: { cellWidth: 35 },
          1: { cellWidth: "auto" },
          2: { cellWidth: 20, halign: "center" },
        };
        if (!hidePrices) {
          colStyles[3] = { cellWidth: 30, halign: "right" };
          colStyles[4] = { cellWidth: 35, halign: "right", fontStyle: "bold" };
        }

        autoTable(doc, {
          startY: tableY,
          head,
          body,
          theme: docType === "bon_livraison" ? "grid" : "plain",
          headStyles: {
            fillColor:   C.BLACK,
            textColor:   C.WHITE,
            fontStyle:   "bold",
            fontSize:    8,
            cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
          },
          bodyStyles: {
            fontSize:    8.5,
            textColor:   C.DARK,
            cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
            lineColor:   docType === "bon_livraison" ? [200, 200, 200] : C.GRAY4,
            lineWidth:   docType === "bon_livraison" ? 0.3 : 0.2,
          },
          alternateRowStyles: { fillColor: [247, 247, 247] },
          columnStyles: colStyles,
          margin: { left: ML, right: MR },
        });

        const finalY = (doc as any).lastAutoTable.finalY ?? tableY + 20;

        // Totaux Standard à droite (absents pour BC)
        if (!hidePrices) {
          const TW = 74;
          const TX = W - MR - TW;
          let ty   = finalY + 8;

          if (docType === "bon_livraison") {
            // Affichage simplifié sans TVA
            doc.setFillColor(...C.BLACK);
            doc.rect(TX - 2, ty - 1, TW + 4, 12, "F");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(...C.WHITE);
            doc.text("TOTAL", TX + 2, ty + 6.5);
            doc.text(`${Number(facture.total_ht).toFixed(2)} ${devise}`, W - MR - 2, ty + 6.5, { align: "right" });
          } else {
            // Devis (HT + TVA + TTC)
            const row = (label: string, value: string, bold = false) => {
              doc.setFont("helvetica", bold ? "bold" : "normal");
              doc.setFontSize(9);
              doc.setTextColor(...C.GRAY1);
              doc.text(label, TX, ty);
              doc.setTextColor(...(bold ? C.BLACK : C.DARK));
              doc.text(value, W - MR, ty, { align: "right" });
              ty += 6;
            };

            doc.setDrawColor(...C.GRAY3);
            doc.setLineWidth(0.3);
            doc.line(TX, ty - 4, W - MR, ty - 4);

            row("Montant HT", `${Number(facture.total_ht).toFixed(2)} ${devise}`);
            row(`TVA (${parametres?.tva || 20}%)`, `${Number(facture.tva).toFixed(2)} ${devise}`);

            doc.setDrawColor(...C.GRAY3);
            doc.line(TX, ty - 2, W - MR, ty - 2);
            ty += 2;

            doc.setFillColor(...C.BLACK);
            doc.rect(TX - 2, ty - 1, TW + 4, 12, "F");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(...C.WHITE);
            doc.text("Total TTC", TX + 2, ty + 6.5);
            doc.text(`${Number(facture.total_ttc).toFixed(2)} ${devise}`, W - MR - 2, ty + 6.5, { align: "right" });
          }
        }
      }

      // =========================================================================
      //  FOOTER
      // =========================================================================
      const siteUrl = parametres?.siteweb || "www.lumenec-sarl.com";

      if (isFacture) {
        // Footer complet : barre dorée + DNS + infos légales

        // Barre dorée centrée
        doc.setFillColor(...C.GOLD);
        doc.rect(W / 2 - 15, H - 18, 30, 1.5, "F");

        // DNS
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...C.BLACK);
        doc.text(siteUrl, W / 2, H - 13, { align: "center" });

        // Infos légales
        const footerLine1 = [
          parametres?.adresse   || "",
          parametres?.telephone ? `Tél : ${parametres.telephone}` : "",
          parametres?.email     || "",
        ].filter(Boolean).join("   ·   ");

        const footerLine2 = [
          parametres?.rc      ? `R.C. : ${parametres.rc}`        : "",
          parametres?.if_taxe ? `I.F. : ${parametres.if_taxe}`  : "",
          parametres?.cnss    ? `C.N.S.S. : ${parametres.cnss}` : "",
          parametres?.ice     ? `ICE : ${parametres.ice}`       : "",
        ].filter(Boolean).join("   ·   ");

        doc.setFontSize(6);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(120, 125, 135);
        if (footerLine1) doc.text(footerLine1, W / 2, H - 8, { align: "center", maxWidth: W - 16 });
        if (footerLine2) doc.text(footerLine2, W / 2, H - 4, { align: "center", maxWidth: W - 16 });

      } else {
        // Footer minimal pour les autres documents
        doc.setFillColor(...C.GOLD);
        doc.rect(W / 2 - 15, H - 10, 30, 1.5, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...C.BLACK);
        doc.text(siteUrl, W / 2, H - 5, { align: "center" });
      }

      // Sortie
      const prefix = isDraft ? "BROUILLON" : (docTypeMap[docType] || "Document");
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
      <button onClick={() => generatePDF("download")} disabled={loading}
        className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-all cursor-pointer"
        title="Télécharger PDF">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      </button>
      <button onClick={() => generatePDF("print")} disabled={loading}
        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-all cursor-pointer"
        title="Aperçu / Imprimer">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
      </button>
    </div>
  );
}
