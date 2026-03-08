import jsPDF from "jspdf";
import QRCode from "qrcode";
import logoImg from "@/assets/logo-transparent.png";

interface CertificateData {
  userName: string;
  userCpf: string;
  completionDate: string;
  verificationCode: string;
  studyHoursTotal: number;
  modulesCompleted: string[];
  missionsCompleted: string[];
}

const COMPANY = "Futuro Real Brasil";
const PUBLISHED_URL = "https://futurorealbrasil.lovable.app";
const CNPJ = "55.276.743/0001-80";

const COLORS = {
  bgDark: [12, 15, 24] as [number, number, number],
  bgPanel: [18, 22, 34] as [number, number, number],
  brandBlue: [45, 110, 195] as [number, number, number],
  brandGreen: [46, 160, 105] as [number, number, number],
  brandGold: [235, 175, 35] as [number, number, number],
  goldLight: [255, 215, 100] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  lightGray: [195, 205, 215] as [number, number, number],
  mutedText: [120, 135, 160] as [number, number, number],
};

function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length === 11)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  return cpf;
}

function formatStudyTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0 && mins > 0) return `${hours}h ${mins}min`;
  if (hours > 0) return `${hours}h`;
  if (mins > 0) return `${mins}min`;
  return "1h";
}

async function loadImageAsDataUrl(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = src;
  });
}

function sc(doc: jsPDF, c: [number, number, number]) {
  doc.setTextColor(c[0], c[1], c[2]);
}

// Elegant double border with ornamental corners
function drawElegantBorder(doc: jsPDF, W: number, H: number) {
  const [r, g, b] = COLORS.brandGold;
  doc.setDrawColor(r, g, b);

  // Outer frame
  doc.setLineWidth(1.2);
  doc.rect(6, 6, W - 12, H - 12);

  // Inner frame
  doc.setLineWidth(0.4);
  doc.rect(10, 10, W - 20, H - 20);

  // Ornamental corner brackets (L-shapes with dots)
  const cLen = 18;
  const offset = 6;
  doc.setLineWidth(0.8);

  const corners = [
    { x: offset, y: offset, dx: 1, dy: 1 },
    { x: W - offset, y: offset, dx: -1, dy: 1 },
    { x: offset, y: H - offset, dx: 1, dy: -1 },
    { x: W - offset, y: H - offset, dx: -1, dy: -1 },
  ];

  corners.forEach(({ x, y, dx, dy }) => {
    doc.line(x, y, x + dx * cLen, y);
    doc.line(x, y, x, y + dy * cLen);
    // Small diamond at corner
    const cx = x + dx * 3;
    const cy = y + dy * 3;
    doc.setFillColor(r, g, b);
    doc.circle(cx, cy, 0.8, "F");
  });

  // Mid-edge diamonds
  doc.setFillColor(r, g, b);
  doc.circle(W / 2, 6, 1, "F");
  doc.circle(W / 2, H - 6, 1, "F");
  doc.circle(6, H / 2, 1, "F");
  doc.circle(W - 6, H / 2, 1, "F");
}

// Elegant horizontal divider with center diamond
function drawDivider(doc: jsPDF, cx: number, y: number, halfW: number) {
  const [r, g, b] = COLORS.brandGold;
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.3);
  doc.line(cx - halfW, y, cx - 3, y);
  doc.line(cx + 3, y, cx + halfW, y);
  // Center diamond
  doc.setFillColor(r, g, b);
  const d = 1.5;
  doc.triangle(cx, y - d, cx + d, y, cx, y + d, "F");
  doc.triangle(cx, y - d, cx - d, y, cx, y + d, "F");
}

// Ornate seal with double ring and star burst effect
function drawSeal(doc: jsPDF, x: number, y: number, radius: number) {
  const [r, g, b] = COLORS.brandGold;
  doc.setDrawColor(r, g, b);

  // Outer serrated ring (simulated with small lines)
  const teeth = 24;
  for (let i = 0; i < teeth; i++) {
    const angle = (i / teeth) * Math.PI * 2;
    const innerR = radius - 1;
    const outerR = radius + 1;
    const x1 = x + Math.cos(angle) * innerR;
    const y1 = y + Math.sin(angle) * innerR;
    const x2 = x + Math.cos(angle) * outerR;
    const y2 = y + Math.sin(angle) * outerR;
    doc.setLineWidth(0.4);
    doc.line(x1, y1, x2, y2);
  }

  // Outer circle
  doc.setLineWidth(0.6);
  doc.circle(x, y, radius, "S");
  // Inner circle
  doc.setLineWidth(0.3);
  doc.circle(x, y, radius - 2, "S");

  // Dark fill center
  doc.setFillColor(COLORS.bgDark[0], COLORS.bgDark[1], COLORS.bgDark[2]);
  doc.circle(x, y, radius - 3, "F");
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.3);
  doc.circle(x, y, radius - 3, "S");

  // Text
  doc.setFont("helvetica", "bold");
  sc(doc, COLORS.brandGold);
  doc.setFontSize(4.5);
  doc.text("CURSO", x, y - 2.5, { align: "center" });
  doc.text("LIVRE", x, y + 1, { align: "center" });
  doc.setFontSize(3);
  doc.text("CERTIFICADO", x, y + 4, { align: "center" });
}

function drawSignatureLine(doc: jsPDF, x: number, y: number, w: number, label: string, name: string) {
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  sc(doc, COLORS.white);
  doc.text(name, x, y - 4, { align: "center" });

  doc.setDrawColor(COLORS.brandGold[0], COLORS.brandGold[1], COLORS.brandGold[2]);
  doc.setLineWidth(0.3);
  doc.line(x - w / 2, y, x + w / 2, y);

  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  sc(doc, COLORS.mutedText);
  doc.text(label, x, y + 5, { align: "center" });
}

// Subtle background pattern (diagonal thin lines)
function drawBgPattern(doc: jsPDF, W: number, H: number) {
  doc.setDrawColor(25, 30, 45);
  doc.setLineWidth(0.1);
  for (let i = -H; i < W + H; i += 12) {
    doc.line(i, 0, i + H, H);
  }
}

export async function generateCertificatePDF(data: CertificateData, _siteUrl: string) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;

  const verifyUrl = `${PUBLISHED_URL}/verificar-certificado?code=${data.verificationCode}`;

  const [logoDataUrl, qrDataUrl] = await Promise.all([
    loadImageAsDataUrl(logoImg),
    QRCode.toDataURL(verifyUrl, { width: 400, margin: 1 }).catch(() => null),
  ]);

  // ==================== FRONT PAGE ====================
  // Background
  doc.setFillColor(COLORS.bgDark[0], COLORS.bgDark[1], COLORS.bgDark[2]);
  doc.rect(0, 0, W, H, "F");
  drawBgPattern(doc, W, H);

  // Top accent stripe (Brazil colors)
  doc.setFillColor(COLORS.brandGreen[0], COLORS.brandGreen[1], COLORS.brandGreen[2]);
  doc.rect(0, 0, W, 2.5, "F");
  doc.setFillColor(COLORS.brandGold[0], COLORS.brandGold[1], COLORS.brandGold[2]);
  doc.rect(0, 2.5, W, 1.2, "F");
  doc.setFillColor(COLORS.brandBlue[0], COLORS.brandBlue[1], COLORS.brandBlue[2]);
  doc.rect(0, 3.7, W, 1.8, "F");

  // Bottom accent stripe
  doc.setFillColor(COLORS.brandBlue[0], COLORS.brandBlue[1], COLORS.brandBlue[2]);
  doc.rect(0, H - 5.5, W, 1.8, "F");
  doc.setFillColor(COLORS.brandGold[0], COLORS.brandGold[1], COLORS.brandGold[2]);
  doc.rect(0, H - 3.7, W, 1.2, "F");
  doc.setFillColor(COLORS.brandGreen[0], COLORS.brandGreen[1], COLORS.brandGreen[2]);
  doc.rect(0, H - 2.5, W, 2.5, "F");

  drawElegantBorder(doc, W, H);

  // Logo
  doc.addImage(logoDataUrl, "PNG", W / 2 - 14, 12, 28, 28);

  // Title
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  sc(doc, COLORS.brandGold);
  doc.text("CERTIFICADO DE CONCLUSÃO", W / 2, 52, { align: "center" });

  // Subtitle
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  sc(doc, COLORS.mutedText);
  doc.text("Curso Livre de Educação Financeira Familiar", W / 2, 59, { align: "center" });

  drawDivider(doc, W / 2, 64, 70);

  // "Certificamos que"
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  sc(doc, COLORS.lightGray);
  doc.text("Certificamos que", W / 2, 73, { align: "center" });

  // Student name
  doc.setFontSize(22);
  doc.setFont("helvetica", "bolditalic");
  sc(doc, COLORS.white);
  doc.text(data.userName.toUpperCase(), W / 2, 84, { align: "center" });

  // Underline below name
  const nameWidth = doc.getTextWidth(data.userName.toUpperCase());
  drawDivider(doc, W / 2, 87, Math.min(nameWidth / 2 + 10, 80));

  // CPF
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  sc(doc, COLORS.mutedText);
  doc.text(`CPF: ${formatCPF(data.userCpf)}`, W / 2, 93, { align: "center" });

  // Body text
  const studyTimeStr = formatStudyTime(data.studyHoursTotal);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  sc(doc, COLORS.lightGray);
  const bodyText = `concluiu com êxito o Curso Livre de Educação Financeira Familiar oferecido pelo ${COMPANY} (CNPJ: ${CNPJ}), com carga horária total de ${studyTimeStr}, em reconhecimento ao seu empenho e dedicação aos estudos.`;
  const bodyLines = doc.splitTextToSize(bodyText, 210);
  doc.text(bodyLines, W / 2, 101, { align: "center" });

  // Curso livre notice (smaller, separate)
  doc.setFontSize(6.5);
  sc(doc, COLORS.mutedText);
  doc.text(
    "Este certificado refere-se a um Curso Livre conforme Lei nº 9.394/96, Art. 42.",
    W / 2,
    118,
    { align: "center" }
  );

  // Date
  doc.setFontSize(7.5);
  sc(doc, COLORS.lightGray);
  doc.text(`Data de Conclusão: ${data.completionDate}`, W / 2, 126, { align: "center" });

  drawDivider(doc, W / 2, 132, 60);

  // Signatures — well spaced from seal
  drawSignatureLine(doc, 80, 158, 55, "Nome do Aluno", data.userName);
  drawSignatureLine(doc, W - 80, 158, 55, "Coordenação", COMPANY);

  // Seal — centered between signatures, vertically aligned
  drawSeal(doc, W / 2, 155, 13);

  // QR Code — bottom-right, inside border
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, "PNG", W - 42, H - 38, 22, 22);
    doc.setFontSize(4.5);
    sc(doc, COLORS.mutedText);
    doc.text("Validar Certificado", W - 31, H - 14.5, { align: "center" });
  }

  // Verification code — bottom-left
  doc.setFontSize(5.5);
  sc(doc, COLORS.mutedText);
  doc.text(`Código: ${data.verificationCode}`, 38, H - 16, { align: "center" });

  // ==================== BACK PAGE ====================
  doc.addPage("a4", "landscape");

  doc.setFillColor(COLORS.bgDark[0], COLORS.bgDark[1], COLORS.bgDark[2]);
  doc.rect(0, 0, W, H, "F");
  drawBgPattern(doc, W, H);

  // Top/bottom stripes
  doc.setFillColor(COLORS.brandGreen[0], COLORS.brandGreen[1], COLORS.brandGreen[2]);
  doc.rect(0, 0, W, 2.5, "F");
  doc.setFillColor(COLORS.brandGold[0], COLORS.brandGold[1], COLORS.brandGold[2]);
  doc.rect(0, 2.5, W, 1.2, "F");
  doc.setFillColor(COLORS.brandBlue[0], COLORS.brandBlue[1], COLORS.brandBlue[2]);
  doc.rect(0, 3.7, W, 1.8, "F");

  doc.setFillColor(COLORS.brandBlue[0], COLORS.brandBlue[1], COLORS.brandBlue[2]);
  doc.rect(0, H - 5.5, W, 1.8, "F");
  doc.setFillColor(COLORS.brandGold[0], COLORS.brandGold[1], COLORS.brandGold[2]);
  doc.rect(0, H - 3.7, W, 1.2, "F");
  doc.setFillColor(COLORS.brandGreen[0], COLORS.brandGreen[1], COLORS.brandGreen[2]);
  doc.rect(0, H - 2.5, W, 2.5, "F");

  drawElegantBorder(doc, W, H);

  // Logo
  doc.addImage(logoDataUrl, "PNG", W / 2 - 10, 9, 20, 20);

  // Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  sc(doc, COLORS.brandGold);
  doc.text("CONTEÚDO PROGRAMÁTICO", W / 2, 36, { align: "center" });

  // Student info
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  sc(doc, COLORS.mutedText);
  doc.text(`Aluno(a): ${data.userName}  |  Código: ${data.verificationCode}`, W / 2, 42, { align: "center" });

  drawDivider(doc, W / 2, 45, 100);

  // ---- MODULES (2x2 grid) ----
  const moduleLabels: Record<string, string> = {
    iniciante: "Módulo Iniciante",
    organizado: "Módulo Organizado",
    investidor: "Módulo Investidor",
    independente: "Módulo Independente",
  };
  const moduleEmojis: Record<string, string> = {
    iniciante: "🌱",
    organizado: "📋",
    investidor: "📈",
    independente: "🏆",
  };

  const moduleTopics: Record<string, string[]> = {
    iniciante: [
      "Por que o dinheiro acaba antes do mês",
      "Como sobreviver com salário mínimo",
      "Reserva de emergência na vida real",
      "O que são juros e como te afetam",
      "Como fazer um orçamento simples",
      "Diferença entre querer e precisar",
      "Como evitar o cheque especial",
      "Metas financeiras: como definir",
      "Conversar sobre dinheiro em família",
      "Golpes financeiros: proteção",
    ],
    organizado: [
      "Dívida não é sentença de morte",
      "Compra por impulso: como parar",
      "Pix parcelado e cartão: armadilhas",
      "Método bola de neve para dívidas",
      "Como economizar no supermercado",
      "Contas fixas: como reduzir",
      "Renda extra: ideias práticas",
      "Direitos do consumidor endividado",
      "Apps financeiros gratuitos",
      "Planejamento mensal eficiente",
    ],
    investidor: [
      "Poupança vs CDB vs Tesouro",
      "Como funciona a bolsa de valores",
      "Renda fixa para iniciantes",
      "Fundos de investimento",
      "Como avaliar riscos",
      "Imposto de renda: investimentos",
      "Previdência privada: vale?",
      "Diversificação de carteira",
      "Investir com pouco dinheiro",
      "Erros comuns ao investir",
    ],
    independente: [
      "Independência financeira: conceito",
      "Renda passiva: como construir",
      "Imóveis como investimento",
      "Empreendedorismo e finanças",
      "Planejamento para aposentadoria",
      "Herança e planejamento sucessório",
      "Educação financeira para filhos",
      "Proteção patrimonial: seguros",
      "Filantropia e impacto social",
      "Seu plano de liberdade financeira",
    ],
  };

  const leftCol = 20;
  const rightCol = W / 2 + 8;
  const moduleKeys = Object.keys(moduleLabels);

  moduleKeys.forEach((key, idx) => {
    const col = idx % 2 === 0 ? leftCol : rightCol;
    const startY = idx < 2 ? 50 : 108;

    // Module title with colored underline
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    sc(doc, COLORS.brandGreen);
    doc.text(`${moduleEmojis[key]}  ${moduleLabels[key]}`, col, startY);

    // Small underline
    doc.setDrawColor(COLORS.brandGreen[0], COLORS.brandGreen[1], COLORS.brandGreen[2]);
    doc.setLineWidth(0.2);
    doc.line(col, startY + 1.5, col + 50, startY + 1.5);

    // Topics
    doc.setFontSize(5.2);
    doc.setFont("helvetica", "normal");
    sc(doc, COLORS.lightGray);
    const topics = moduleTopics[key] || [];
    topics.forEach((topic, i) => {
      doc.text(`•  ${topic}`, col + 1, startY + 5.5 + i * 4.8);
    });
  });

  // ---- MISSIONS ----
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  sc(doc, COLORS.brandGold);
  doc.text("MISSÕES CONCLUÍDAS", W / 2, 162, { align: "center" });

  drawDivider(doc, W / 2, 164.5, 50);

  // Missions in 3 columns to fit better
  const missions = data.missionsCompleted;
  const colCount = 3;
  const perCol = Math.ceil(missions.length / colCount);
  const mCols = [25, W / 3 + 10, (2 * W) / 3 - 5];

  doc.setFontSize(4.8);
  doc.setFont("helvetica", "normal");
  sc(doc, COLORS.lightGray);

  missions.forEach((mission, i) => {
    const colIdx = Math.floor(i / perCol);
    const row = i % perCol;
    const x = mCols[Math.min(colIdx, 2)];
    doc.text(`✓  ${mission}`, x, 169 + row * 3.2);
  });

  // ---- SOCIAL & FOOTER ----
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  sc(doc, COLORS.brandGold);
  doc.text("Siga-nos:", W / 2, H - 20, { align: "center" });

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  sc(doc, COLORS.white);
  doc.text(
    "Instagram: @futurorealbrasil   |   YouTube: Futuro Real Brasil",
    W / 2,
    H - 15.5,
    { align: "center" }
  );

  doc.setFontSize(4.5);
  sc(doc, COLORS.mutedText);
  doc.text(
    "Este certificado refere-se a um Curso Livre, conforme Lei nº 9.394/96, Art. 42. Não substitui cursos técnicos, de graduação ou pós-graduação.",
    W / 2,
    H - 10,
    { align: "center" }
  );

  doc.setFontSize(4.5);
  sc(doc, COLORS.mutedText);
  doc.text(
    `Código: ${data.verificationCode}  |  Verifique em: ${PUBLISHED_URL}/verificar-certificado`,
    W / 2,
    H - 7,
    { align: "center" }
  );

  doc.save(`certificado-${data.verificationCode}.pdf`);
}
