import jsPDF from "jspdf";
import type { SavingsTransaction } from "@/hooks/useSavingsTransactions";

const tipoLabels: Record<string, string> = {
  guardado_add: "Guardado (+)",
  guardado_remove: "Guardado (-)",
  reserva_add: "Reserva (+)",
  reserva_remove: "Reserva (-)",
};

export function generateTransactionsPDF(transactions: SavingsTransaction[], monthName: string, year: number) {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text("Relatorio Financeiro", 14, 20);
  
  doc.setFontSize(12);
  doc.text(`${monthName} ${year}`, 14, 30);
  
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR")}`, 14, 38);
  
  doc.setDrawColor(200);
  doc.line(14, 42, 196, 42);
  
  let y = 50;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Data", 14, y);
  doc.text("Tipo", 55, y);
  doc.text("Valor (R$)", 110, y);
  doc.text("Descricao", 145, y);
  
  doc.line(14, y + 2, 196, y + 2);
  y += 8;
  
  doc.setFont("helvetica", "normal");
  
  if (transactions.length === 0) {
    doc.text("Nenhuma movimentacao neste mes.", 14, y);
  } else {
    for (const tx of transactions) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      const date = new Date(tx.created_at).toLocaleDateString("pt-BR");
      const tipo = tipoLabels[tx.tipo] || tx.tipo;
      const isRemove = tx.tipo.includes("remove");
      const valor = `${isRemove ? "-" : "+"}${tx.valor.toFixed(2)}`;
      const desc = (tx.descricao || "-").substring(0, 28);
      
      doc.text(date, 14, y);
      doc.text(tipo, 55, y);
      doc.text(valor, 110, y);
      doc.text(desc, 145, y);
      y += 7;
    }
  }
  
  // Summary
  y += 10;
  if (y > 250) { doc.addPage(); y = 20; }
  doc.line(14, y, 196, y);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Resumo:", 14, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  
  const totalAdded = transactions.filter(t => t.tipo.includes("add")).reduce((s, t) => s + t.valor, 0);
  const totalRemoved = transactions.filter(t => t.tipo.includes("remove")).reduce((s, t) => s + t.valor, 0);
  
  doc.text(`Total adicionado: R$ ${totalAdded.toFixed(2)}`, 14, y);
  y += 6;
  doc.text(`Total retirado: R$ ${totalRemoved.toFixed(2)}`, 14, y);
  y += 6;
  doc.text(`Saldo liquido: R$ ${(totalAdded - totalRemoved).toFixed(2)}`, 14, y);
  
  doc.save(`relatorio-${monthName}-${year}.pdf`);
}
