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

const CNPJ = "55.276.743/0001-80";
const COMPANY = "Futuro Real Brasil";

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

// Colors
const DARK_GREEN: [number, number, number] = [0, 80, 50];
const GREEN: [number, number, number] = [0, 100, 60];
const GOLD: [number, number, number] = [180, 140, 40];
const DARK_GOLD: [number, number, number] = [140, 110, 30];
const CREAM_BG: [number, number, number] = [255, 248, 230];
const FRAME_DARK: [number, number, number] = [60, 40, 20];
const FRAME_GOLD: [number, number, number] = [180, 150, 60];
const TEXT_DARK: [number, number, number] = [50, 40, 30];
const TEXT_GRAY: [number, number, number] = [100, 90, 80];

function drawOrnateFrame(doc: jsPDF, W: number, H: number) {
  // Outer dark frame
  doc.setFillColor(...FRAME_DARK);
  doc.rect(0, 0, W, H, "F");

  // Gold border
  doc.setFillColor(...FRAME_GOLD);
  doc.rect(4, 4, W - 8, H - 8, "F");

  // Dark inner frame
  doc.setFillColor(...FRAME_DARK);
  doc.rect(7, 7, W - 14, H - 14, "F");

  // Gold inner border
  doc.setFillColor(200, 170, 70);
  doc.rect(9, 9, W - 18, H - 18, "F");

  // Cream interior
  doc.setFillColor(...CREAM_BG);
  doc.rect(12, 12, W - 24, H - 24, "F");

  // Gold accent line rectangle
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.rect(16, 16, W - 32, H - 32);

  // Corner ornaments - fleur-de-lis style decorations
  drawCornerOrnament(doc, 16, 16, 1, 1);         // top-left
  drawCornerOrnament(doc, W - 16, 16, -1, 1);    // top-right
  drawCornerOrnament(doc, 16, H - 16, 1, -1);    // bottom-left
  drawCornerOrnament(doc, W - 16, H - 16, -1, -1); // bottom-right
}

function drawCornerOrnament(doc: jsPDF, cx: number, cy: number, dx: number, dy: number) {
  doc.setFillColor(...DARK_GREEN);
  doc.setDrawColor(...DARK_GREEN);
  doc.setLineWidth(1.2);

  // Main diagonal flourish
  doc.line(cx, cy, cx + dx * 18, cy + dy * 18);
  doc.line(cx, cy, cx + dx * 18, cy);
  doc.line(cx, cy, cx, cy + dy * 18);

  // Decorative curves
  doc.setLineWidth(0.8);
  doc.line(cx + dx * 3, cy, cx + dx * 12, cy + dy * 3);
  doc.line(cx, cy + dy * 3, cx + dx * 3, cy + dy * 12);

  // Small diamond
  const dmx = cx + dx * 6;
  const dmy = cy + dy * 6;
  doc.setFillColor(...GOLD);
  doc.circle(dmx, dmy, 1.5, "F");
}

function drawGreenBanner(doc: jsPDF, W: number, y: number, h: number) {
  doc.setFillColor(0, 70, 40);
  doc.roundedRect(W / 2 - 85, y, 170, h, 3, 3, "F");

  // Gold trim lines
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(W / 2 - 83, y + 1.5, W / 2 + 83, y + 1.5);
  doc.line(W / 2 - 83, y + h - 1.5, W / 2 + 83, y + h - 1.5);
}

function drawGoldSeal(doc: jsPDF, x: number, y: number) {
  // Draw a clean gold seal with rays
  const outerR = 14;
  const innerR = 10;
  const coreR = 8;
  const centerR = 6;

  // Outer serrated edge (star points)
  doc.setFillColor(200, 170, 50);
  const points = 24;
  for (let i = 0; i < points; i++) {
    const angle = (Math.PI * 2 * i) / points;
    const nextAngle = (Math.PI * 2 * (i + 1)) / points;
    const midAngle = (angle + nextAngle) / 2;

    const x1 = x + Math.cos(angle) * outerR;
    const y1 = y + Math.sin(angle) * outerR;
    const x2 = x + Math.cos(midAngle) * (outerR - 3);
    const y2 = y + Math.sin(midAngle) * (outerR - 3);

    doc.triangle(x, y, x1, y1, x2, y2, "F");
  }

  // Inner gold circle
  doc.setFillColor(220, 190, 60);
  doc.circle(x, y, innerR, "F");

  // Dark ring
  doc.setFillColor(160, 130, 40);
  doc.circle(x, y, coreR + 0.5, "F");

  // Gold center
  doc.setFillColor(240, 210, 80);
  doc.circle(x, y, coreR, "F");

  // Inner decorative ring
  doc.setDrawColor(180, 140, 40);
  doc.setLineWidth(0.4);
  doc.circle(x, y, centerR, "S");

  // Star in center
  doc.setFillColor(160, 120, 30);
  const starPoints = 5;
  for (let i = 0; i < starPoints; i++) {
    const angle = (Math.PI * 2 * i) / starPoints - Math.PI / 2;
    const nextAngle = (Math.PI * 2 * ((i + 0.5)) ) / starPoints - Math.PI / 2;
    const sx = x + Math.cos(angle) * 4;
    const sy = y + Math.sin(angle) * 4;
    const mx = x + Math.cos(nextAngle) * 1.8;
    const my = y + Math.sin(nextAngle) * 1.8;
    doc.triangle(x, y, sx, sy, mx, my, "F");
  }
}

function getPublishedUrl(): string {
  return "https://futurorealbrasil.lovable.app";
}

export async function generateCertificatePDF(data: CertificateData, _siteUrl: string) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;

  // Use published URL for QR code so it always opens the real site
  const publishedUrl = getPublishedUrl();
  const verifyUrl = `${publishedUrl}/verificar-certificado?code=${data.verificationCode}`;

  // ===== FRONT PAGE =====
  drawOrnateFrame(doc, W, H);

  // Green banner at top with company name
  drawGreenBanner(doc, W, 25, 16);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("FUTURO REAL BRASIL", W / 2, 35, { align: "center" });

  // Title - "CERTIFICADO"
  doc.setFontSize(34);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK_GOLD);
  doc.text("CERTIFICADO", W / 2, 56, { align: "center" });

  // Gold decorative line
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(W / 2 - 70, 60, W / 2 + 70, 60);

  // "Certificamos que"
  doc.setFontSize(13);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_DARK);
  doc.text("Certificamos que", W / 2, 72, { align: "center" });

  // Student name - ABOVE the line, large and bold
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK_GREEN);
  const nameText = data.userName.toUpperCase();
  doc.text(nameText, W / 2, 86, { align: "center" });

  // Line BELOW the name
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(W / 2 - 70, 89, W / 2 + 70, 89);

  // CPF - visible size
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_GRAY);
  doc.text(`CPF: ${formatCPF(data.userCpf)}`, W / 2, 96, { align: "center" });

  // Body text
  const studyTimeStr = formatStudyTime(data.studyHoursTotal);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_DARK);

  const bodyLines = [
    `concluiu com sucesso o curso de`,
    ``,
    `Gestao Financeira Familiar`,
    ``,
    `oferecido pelo ${COMPANY}, com carga horaria de ${studyTimeStr},`,
    `em reconhecimento ao seu empenho e dedicacao aos estudos.`,
  ];

  let y = 105;
  for (const line of bodyLines) {
    if (line === "Gestao Financeira Familiar") {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...DARK_GREEN);
      doc.text(line, W / 2, y, { align: "center" });
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...TEXT_DARK);
    } else if (line !== "") {
      doc.text(line, W / 2, y, { align: "center" });
    }
    y += 6;
  }

  // Date
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_GRAY);
  doc.text(`Data de conclusao: ${data.completionDate}`, W / 2, y + 2, { align: "center" });

  // ---- Signatures section ----
  const sigLineY = H - 45;

  // Left signature - Aluno name ABOVE line
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK_GREEN);
  doc.text(data.userName, W / 2 - 50, sigLineY - 3, { align: "center" });

  doc.setDrawColor(...DARK_GREEN);
  doc.setLineWidth(0.4);
  doc.line(W / 2 - 80, sigLineY, W / 2 - 20, sigLineY);

  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...TEXT_GRAY);
  doc.text("Aluno(a)", W / 2 - 50, sigLineY + 5, { align: "center" });

  // Right signature - Direcao name ABOVE line
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK_GREEN);
  doc.text(COMPANY, W / 2 + 50, sigLineY - 3, { align: "center" });

  doc.line(W / 2 + 20, sigLineY, W / 2 + 80, sigLineY);

  doc.setFont("helvetica", "italic");
  doc.setTextColor(...TEXT_GRAY);
  doc.setFontSize(9);
  doc.text("Direcao", W / 2 + 50, sigLineY + 5, { align: "center" });

  // Gold Seal between signatures
  drawGoldSeal(doc, W / 2, sigLineY + 2);

  // Company info at bottom
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK_GREEN);
  doc.text(`${COMPANY} - CNPJ: ${CNPJ}`, W / 2, H - 22, { align: "center" });

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_GRAY);
  doc.text("Gestao Financeira Familiar", W / 2, H - 18, { align: "center" });

  // Verification code
  doc.setFontSize(7);
  doc.setTextColor(120, 110, 100);
  doc.text(`Codigo de verificacao: ${data.verificationCode}`, W / 2, H - 14, { align: "center" });

  // ===== BACK PAGE (VERSO) =====
  doc.addPage("a4", "landscape");
  drawOrnateFrame(doc, W, H);

  // Header banner
  drawGreenBanner(doc, W, 22, 14);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("CONTEUDO PROGRAMATICO", W / 2, 31, { align: "center" });

  // Gold line
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(W / 2 - 60, 39, W / 2 + 60, 39);

  // Module labels
  const moduleLabels: Record<string, string> = {
    iniciante: "Iniciante",
    organizado: "Organizado",
    investidor: "Investidor",
    independente: "Independente",
  };

  // All education topics by module
  const eduTopics: Record<string, string[]> = {
    iniciante: [
      "Por que o dinheiro acaba antes do mes",
      "Como sobreviver com salario minimo",
      "Reserva de emergencia na vida real",
      "O que sao juros e como eles te afetam",
      "Como fazer um orcamento simples",
      "Diferenca entre querer e precisar",
      "Como evitar o cheque especial",
      "Metas financeiras: como definir as suas",
      "Como conversar sobre dinheiro em familia",
      "Golpes financeiros: como se proteger",
    ],
    organizado: [
      "Divida nao e sentenca de morte",
      "Compra por impulso: como parar",
      "Pix parcelado e cartao: armadilhas",
      "Metodo bola de neve para dividas",
      "Como economizar no supermercado",
      "Contas fixas: como reduzir",
      "Planejamento financeiro mensal",
      "Renda extra: ideias praticas",
      "Como negociar contas e dividas",
      "Automacao financeira",
    ],
    investidor: [
      "O que e Renda Fixa",
      "CDB com Liquidez Diaria",
      "Como investir passo a passo",
      "Tesouro Direto: investindo no governo",
      "Diversificacao: nao coloque tudo em um cesto",
      "Fundos Imobiliarios (FIIs)",
      "Imposto de Renda sobre investimentos",
      "Perfil de investidor: qual e o seu",
      "ETFs: investindo em indices",
      "Juros compostos: a 8a maravilha",
    ],
    independente: [
      "LCI e LCA: renda fixa sem imposto",
      "Poupanca x CDB x Tesouro: comparativo",
      "Quanto investir por mes",
      "Erros comuns de quem comeca",
      "Independencia financeira: o que e",
      "Previdencia privada: vale a pena",
      "Investimentos internacionais",
      "Criando multiplas fontes de renda",
      "Planejamento sucessorio e protecao",
      "Mindset de abundancia financeira",
    ],
  };

  // Draw modules in 2x2 grid with LARGER font
  const colPositions = [24, W / 2 + 8];
  const rowPositions = [46, 115];
  const levels = ["iniciante", "organizado", "investidor", "independente"];

  levels.forEach((level, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = colPositions[col];
    let cy = rowPositions[row];

    // Module title
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_GREEN);
    doc.text(moduleLabels[level], x, cy);
    cy += 6;

    const topics = eduTopics[level] || [];
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_DARK);
    for (const topic of topics) {
      doc.text(`• ${topic}`, x + 3, cy);
      cy += 5;
    }
  });

  // Missions section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK_GREEN);
  doc.text("Missoes Concluidas", W / 2, 172, { align: "center" });

  // Gold line under missions title
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.line(W / 2 - 40, 174, W / 2 + 40, 174);

  let mY = 178;
  const missionsPerCol = Math.ceil(data.missionsCompleted.length / 3);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_DARK);

  data.missionsCompleted.forEach((mission, i) => {
    const col = Math.floor(i / missionsPerCol);
    const row = i % missionsPerCol;
    const mx = 24 + col * 88;
    const my = mY + row * 4;
    if (my < H - 28) {
      doc.text(`• ${mission.substring(0, 50)}`, mx, my);
    }
  });

  // QR Code on back - bottom right
  try {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 300, margin: 1 });
    doc.addImage(qrDataUrl, "PNG", W - 48, H - 46, 26, 26);
  } catch (e) {
    console.error("QR generation failed", e);
  }

  // Footer text - properly spaced to avoid overlap
  doc.setFontSize(6);
  doc.setTextColor(120, 110, 100);
  doc.text(`Verificacao: ${data.verificationCode}`, W - 35, H - 18, { align: "center" });

  doc.setFontSize(7);
  doc.setTextColor(...TEXT_GRAY);
  doc.text(`${COMPANY} - CNPJ: ${CNPJ}`, W / 2 - 15, H - 20, { align: "center" });
  doc.text("Gestao Financeira Familiar", W / 2 - 15, H - 16, { align: "center" });

  doc.save(`certificado-${data.verificationCode}.pdf`);
}
