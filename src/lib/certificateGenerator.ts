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
const DARK_GREEN = [0, 80, 50];
const GREEN = [0, 100, 60];
const GOLD = [180, 140, 40];
const DARK_GOLD = [140, 110, 30];
const CREAM_BG = [255, 248, 230];
const FRAME_DARK = [60, 40, 20];
const FRAME_GOLD = [180, 150, 60];
const TEXT_DARK = [50, 40, 30];
const TEXT_GRAY = [100, 90, 80];

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

  // Green decorative banner bar at top
  doc.setFillColor(...DARK_GREEN);
  doc.rect(12, 12, W - 24, 3, "F");

  // Gold accent lines
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.rect(15, 15, W - 30, H - 30);
}

function drawGreenBanner(doc: jsPDF, W: number, y: number, h: number) {
  // Dark green banner
  doc.setFillColor(0, 70, 40);
  doc.roundedRect(W / 2 - 80, y, 160, h, 2, 2, "F");

  // Gold trim lines
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(W / 2 - 78, y + 1, W / 2 + 78, y + 1);
  doc.line(W / 2 - 78, y + h - 1, W / 2 + 78, y + h - 1);
}

function drawMedallion(doc: jsPDF, x: number, y: number) {
  // Outer gold circle
  doc.setFillColor(...GOLD);
  doc.circle(x, y, 12, "F");
  doc.setFillColor(...DARK_GREEN);
  doc.circle(x, y, 9, "F");
  doc.setFillColor(220, 200, 80);
  doc.circle(x, y, 7, "F");
  doc.setFillColor(...GREEN);
  doc.circle(x, y, 5.5, "F");

  // Laurel leaves (simplified arcs)
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 6) * i - Math.PI / 2;
    const lx = x + Math.cos(angle + Math.PI) * 13;
    const ly = y + Math.sin(angle + Math.PI) * 13;
    doc.line(x - 12, y + 2 + i * 1.5, lx, ly);
  }
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 6) * i - Math.PI / 2;
    const lx = x + Math.cos(angle) * 13;
    const ly = y + Math.sin(angle) * 13;
    doc.line(x + 12, y + 2 + i * 1.5, lx, ly);
  }
}

export async function generateCertificatePDF(data: CertificateData, siteUrl: string) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;

  // ===== FRONT PAGE =====
  drawOrnateFrame(doc, W, H);

  // Title - "Certificado de Conclusao"
  doc.setFontSize(36);
  doc.setFont("helvetica", "bolditalic");
  doc.setTextColor(...DARK_GOLD);
  doc.text("Certificado de Conclusao", W / 2, 38, { align: "center" });

  // Green banner with course name
  drawGreenBanner(doc, W, 46, 22);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Educacao Financeira", W / 2, 55, { align: "center" });

  doc.setFontSize(13);
  doc.setFont("helvetica", "bolditalic");
  doc.setTextColor(220, 200, 80);
  doc.text("Futuro Real Brasil", W / 2, 63, { align: "center" });

  // Subtitle
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...GOLD);
  doc.text("Planeje, Invista, Conquiste a Liberdade Financeira!", W / 2, 74, { align: "center" });

  // Decorative gold line
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(W / 2 - 60, 78, W / 2 + 60, 78);

  // Student name
  doc.setFontSize(24);
  doc.setFont("helvetica", "bolditalic");
  doc.setTextColor(...TEXT_DARK);
  doc.text(data.userName, W / 2, 90, { align: "center" });

  // Line under name
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.line(W / 2 - 55, 93, W / 2 + 55, 93);

  // CPF
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_GRAY);
  doc.text(`CPF: ${formatCPF(data.userCpf)}`, W / 2, 99, { align: "center" });

  // Body text
  const studyTimeStr = formatStudyTime(data.studyHoursTotal);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_DARK);

  const bodyLines = [
    `Certificamos que o(a) aluno(a) acima concluiu com exito o curso de Educacao Financeira`,
    `oferecido pelo ${COMPANY}, com a carga horaria de ${studyTimeStr} de estudo,`,
    `em reconhecimento ao seu empenho e dedicacao aos estudos.`,
  ];
  let y = 110;
  for (const line of bodyLines) {
    doc.text(line, W / 2, y, { align: "center" });
    y += 6;
  }

  // Date
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_GRAY);
  doc.text(`Data de conclusao: ${data.completionDate}`, W / 2, y + 4, { align: "center" });

  // Verification code
  doc.setFontSize(8);
  doc.setTextColor(120, 110, 100);
  doc.text(`Codigo de verificacao: ${data.verificationCode}`, W / 2, y + 10, { align: "center" });

  // Medallion at bottom left
  drawMedallion(doc, 45, H - 42);

  // Signatures
  const sigY = H - 48;

  // Left signature - Aluno
  doc.setDrawColor(...DARK_GREEN);
  doc.setLineWidth(0.4);
  doc.line(W / 2 - 65, sigY + 10, W / 2 - 5, sigY + 10);
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...TEXT_GRAY);
  doc.text("Aluno(a)", W / 2 - 35, sigY + 15, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...DARK_GREEN);
  doc.text(data.userName, W / 2 - 35, sigY + 20, { align: "center" });

  // Right signature - Direcao
  doc.line(W / 2 + 5, sigY + 10, W / 2 + 65, sigY + 10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...TEXT_GRAY);
  doc.setFontSize(9);
  doc.text("Direcao", W / 2 + 35, sigY + 15, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...DARK_GREEN);
  doc.text(COMPANY, W / 2 + 35, sigY + 20, { align: "center" });

  // Company info at bottom center
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK_GREEN);
  doc.text(COMPANY, W / 2, H - 22, { align: "center" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_GRAY);
  doc.text(`CNPJ: ${CNPJ}`, W / 2, H - 18, { align: "center" });

  // QR Code on front (bottom right)
  const verifyUrl = `${siteUrl}/verificar-certificado?code=${data.verificationCode}`;
  try {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 200, margin: 1 });
    doc.addImage(qrDataUrl, "PNG", W - 50, H - 55, 30, 30);
    doc.setFontSize(6);
    doc.setTextColor(120, 110, 100);
    doc.text("Escaneie para verificar", W - 35, H - 22, { align: "center" });
  } catch (e) {
    console.error("QR generation failed", e);
  }

  // ===== BACK PAGE (VERSO) =====
  doc.addPage("a4", "landscape");
  drawOrnateFrame(doc, W, H);

  // Header
  doc.setFontSize(28);
  doc.setFont("helvetica", "bolditalic");
  doc.setTextColor(...DARK_GOLD);
  doc.text("Conteudo Programatico", W / 2, 32, { align: "center" });

  // Gold line
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(W / 2 - 55, 36, W / 2 + 55, 36);

  // Module labels
  const moduleLabels: Record<string, string> = {
    iniciante: "Modulo 1 - Iniciante",
    organizado: "Modulo 2 - Organizado",
    investidor: "Modulo 3 - Investidor",
    independente: "Modulo 4 - Independente",
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

  // Draw modules in 2x2 grid
  const colPositions = [22, W / 2 + 5];
  const rowPositions = [42, 110];
  const levels = ["iniciante", "organizado", "investidor", "independente"];

  levels.forEach((level, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = colPositions[col];
    let cy = rowPositions[row];

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_GREEN);
    doc.text(moduleLabels[level], x, cy);
    cy += 5;

    const topics = eduTopics[level] || [];
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_DARK);
    for (const topic of topics) {
      doc.text(`• ${topic}`, x + 2, cy);
      cy += 4;
    }
  });

  // Missions section
  let mY = 155;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK_GREEN);
  doc.text("Missoes Concluidas", 22, mY);
  mY += 5;

  const missionsPerCol = Math.ceil(data.missionsCompleted.length / 3);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_DARK);

  data.missionsCompleted.forEach((mission, i) => {
    const col = Math.floor(i / missionsPerCol);
    const row = i % missionsPerCol;
    const mx = 24 + col * 90;
    const my = mY + row * 4;
    if (my < H - 25) {
      doc.text(`• ${mission.substring(0, 45)}`, mx, my);
    }
  });

  // QR Code on back
  try {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 200, margin: 1 });
    doc.addImage(qrDataUrl, "PNG", W - 50, H - 50, 28, 28);
  } catch (e) {
    console.error("QR generation failed", e);
  }

  doc.setFontSize(6);
  doc.setTextColor(120, 110, 100);
  doc.text("Escaneie para verificar", W - 36, H - 20, { align: "center" });
  doc.text(`Codigo: ${data.verificationCode}`, W - 36, H - 17, { align: "center" });

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_GRAY);
  doc.text(`${COMPANY} - CNPJ: ${CNPJ} - Gestao Financeira Familiar`, W / 2, H - 15, { align: "center" });
  doc.text(verifyUrl, W / 2, H - 11, { align: "center" });

  doc.save(`certificado-${data.verificationCode}.pdf`);
}
