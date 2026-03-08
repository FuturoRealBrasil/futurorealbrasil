import jsPDF from "jspdf";
import QRCode from "qrcode";

interface CertificateData {
  userName: string;
  userCpf: string;
  completionDate: string;
  verificationCode: string;
  studyHoursTotal: number;
  modulesCompleted: string[];
  missionsCompleted: string[];
}

function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  return cpf;
}

function formatStudyTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0 && mins > 0) return `${hours}h ${mins}min`;
  if (hours > 0) return `${hours}h`;
  return `${mins}min`;
}

export async function generateCertificatePDF(data: CertificateData, siteUrl: string) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;

  // ===== FRONT PAGE =====
  // Border
  doc.setDrawColor(0, 100, 60);
  doc.setLineWidth(2);
  doc.rect(8, 8, W - 16, H - 16);
  doc.setDrawColor(0, 150, 90);
  doc.setLineWidth(0.5);
  doc.rect(12, 12, W - 24, H - 24);

  // Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 100, 60);
  doc.text("FUTURO REAL BRASIL", W / 2, 35, { align: "center" });

  doc.setFontSize(28);
  doc.setTextColor(0, 80, 50);
  doc.text("CERTIFICADO", W / 2, 50, { align: "center" });

  // Decorative line
  doc.setDrawColor(0, 150, 90);
  doc.setLineWidth(0.8);
  doc.line(W / 2 - 50, 55, W / 2 + 50, 55);

  // Body text
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text("Certificamos que", W / 2, 70, { align: "center" });

  // User name
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 60, 40);
  doc.text(data.userName.toUpperCase(), W / 2, 82, { align: "center" });

  // CPF
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`CPF: ${formatCPF(data.userCpf)}`, W / 2, 90, { align: "center" });

  // Course description
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text("concluiu com sucesso o curso de", W / 2, 102, { align: "center" });

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 80, 50);
  doc.text("Gestao Financeira Familiar", W / 2, 112, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);

  const studyTimeStr = formatStudyTime(data.studyHoursTotal);
  const lines = [
    "Oferecido pela plataforma Futuro Real Brasil,",
    `com carga horaria de ${studyTimeStr} de estudo,`,
    "abordando organizacao financeira, controle de gastos",
    "e planejamento financeiro familiar com Missoes Diarias.",
  ];
  let y = 124;
  for (const line of lines) {
    doc.text(line, W / 2, y, { align: "center" });
    y += 7;
  }

  // Completion date
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(`Data de conclusao: ${data.completionDate}`, W / 2, y + 5, { align: "center" });

  // Verification code
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Codigo de verificacao: ${data.verificationCode}`, W / 2, y + 13, { align: "center" });

  // Signatures
  const sigY = H - 40;
  doc.setDrawColor(0, 100, 60);
  doc.setLineWidth(0.5);

  // Left signature - Aluno
  doc.line(W / 2 - 90, sigY, W / 2 - 20, sigY);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Aluno", W / 2 - 55, sigY + 5, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 60, 40);
  doc.text(data.userName, W / 2 - 55, sigY + 11, { align: "center" });

  // Right signature - Direcao
  doc.line(W / 2 + 20, sigY, W / 2 + 90, sigY);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Direcao", W / 2 + 55, sigY + 5, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 60, 40);
  doc.text("Futuro Real Brasil", W / 2 + 55, sigY + 11, { align: "center" });

  // ===== BACK PAGE (VERSO) =====
  doc.addPage("a4", "landscape");

  // Border
  doc.setDrawColor(0, 100, 60);
  doc.setLineWidth(2);
  doc.rect(8, 8, W - 16, H - 16);
  doc.setDrawColor(0, 150, 90);
  doc.setLineWidth(0.5);
  doc.rect(12, 12, W - 24, H - 24);

  // Header
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 100, 60);
  doc.text("CONTEUDO PROGRAMATICO", W / 2, 25, { align: "center" });

  doc.setDrawColor(0, 150, 90);
  doc.setLineWidth(0.8);
  doc.line(W / 2 - 50, 29, W / 2 + 50, 29);

  // Modules - Left column
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 80, 50);

  const moduleLabels: Record<string, string> = {
    iniciante: "Modulo 1 - Iniciante",
    organizado: "Modulo 2 - Organizado",
    investidor: "Modulo 3 - Investidor",
    independente: "Modulo 4 - Independente",
  };

  let colX = 22;
  let colY = 38;
  const colWidth = 130;

  doc.text("MODULOS DE EDUCACAO FINANCEIRA", colX, colY);
  colY += 7;

  for (const mod of data.modulesCompleted) {
    if (colY > H - 30) {
      colX = W / 2 + 10;
      colY = 38;
    }
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const label = moduleLabels[mod] || mod;
    doc.text(`✓ ${label}`, colX + 2, colY);
    colY += 5;
  }

  // Missions - Right side or continuation
  colY += 5;
  if (colY > H - 60) {
    colX = W / 2 + 10;
    colY = 38;
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 80, 50);
  doc.text("MISSOES CONCLUIDAS", colX, colY);
  colY += 7;

  const missionsPerCol = Math.ceil(data.missionsCompleted.length / 2);
  let missionCol = 0;
  let mStartX = colX + 2;
  let mStartY = colY;

  for (let i = 0; i < data.missionsCompleted.length; i++) {
    if (i === missionsPerCol && missionCol === 0) {
      missionCol = 1;
      mStartX = W / 2 + 10;
      mStartY = colY;
    }
    const currentY = missionCol === 0 ? colY + i * 5 : mStartY + (i - missionsPerCol) * 5;
    if (currentY > H - 35) continue;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const missionText = data.missionsCompleted[i].substring(0, 50);
    doc.text(`✓ ${missionText}`, mStartX, currentY);
  }

  // QR Code
  const verifyUrl = `${siteUrl}/verificar-certificado?code=${data.verificationCode}`;
  try {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 200, margin: 1 });
    doc.addImage(qrDataUrl, "PNG", W - 55, H - 55, 35, 35);
  } catch (e) {
    console.error("QR generation failed", e);
  }

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("Escaneie para verificar", W - 37.5, H - 17, { align: "center" });

  // Verification code on back
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Codigo: ${data.verificationCode}`, W - 37.5, H - 13, { align: "center" });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Futuro Real Brasil - Gestao Financeira Familiar", W / 2, H - 14, { align: "center" });
  doc.text(verifyUrl, W / 2, H - 10, { align: "center" });

  doc.save(`certificado-${data.verificationCode}.pdf`);
}
