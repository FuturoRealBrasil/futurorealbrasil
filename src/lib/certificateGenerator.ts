import jsPDF from "jspdf";
import QRCode from "qrcode";
import logoImg from "@/assets/logo-transparent.png";
import cornerImg from "@/assets/cert-corner.png";

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

const C = {
  bgDark: [10, 13, 22] as [number, number, number],
  bgDark2: [18, 22, 35] as [number, number, number],
  brandBlue: [45, 110, 195] as [number, number, number],
  brandGreen: [46, 160, 105] as [number, number, number],
  brandGold: [235, 175, 35] as [number, number, number],
  goldDark: [180, 130, 20] as [number, number, number],
  goldLight: [255, 210, 80] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  cream: [220, 225, 235] as [number, number, number],
  muted: [130, 145, 170] as [number, number, number],
};

function formatCPF(cpf: string): string {
  const d = cpf.replace(/\D/g, "");
  return d.length === 11
    ? `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
    : cpf;
}

function formatStudyTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}min`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}min`;
  return "1h";
}

async function loadImg(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = src;
  });
}

function tc(doc: jsPDF, c: [number, number, number]) {
  doc.setTextColor(c[0], c[1], c[2]);
}
function dc(doc: jsPDF, c: [number, number, number]) {
  doc.setDrawColor(c[0], c[1], c[2]);
}
function fc(doc: jsPDF, c: [number, number, number]) {
  doc.setFillColor(c[0], c[1], c[2]);
}

// ---- Ornamental decorative helpers ----

async function drawOrnamentalBorder(doc: jsPDF, W: number, H: number, cornerDataUrl: string) {
  // Outer gold border
  dc(doc, C.brandGold);
  doc.setLineWidth(2.0);
  doc.rect(6, 6, W - 12, H - 12);

  // Inner thin border
  doc.setLineWidth(0.5);
  doc.rect(10, 10, W - 20, H - 20);

  // Second inner border
  doc.setLineWidth(0.3);
  doc.rect(12, 12, W - 24, H - 24);

  // Corner ornament images (the uploaded ornate flourish)
  const cs = 35; // corner size in mm

  // Top-left (original orientation)
  doc.addImage(cornerDataUrl, "PNG", 4, 4, cs, cs);

  // Top-right (flipped horizontally) — use a canvas to flip
  const flippedH = await flipImage(cornerDataUrl, true, false);
  doc.addImage(flippedH, "PNG", W - 4 - cs, 4, cs, cs);

  // Bottom-left (flipped vertically)
  const flippedV = await flipImage(cornerDataUrl, false, true);
  doc.addImage(flippedV, "PNG", 4, H - 4 - cs, cs, cs);

  // Bottom-right (flipped both)
  const flippedHV = await flipImage(cornerDataUrl, true, true);
  doc.addImage(flippedHV, "PNG", W - 4 - cs, H - 4 - cs, cs, cs);

  // Edge center ornaments
  fc(doc, C.brandGold);
  drawEdgeOrnament(doc, W / 2, 6, 0);
  drawEdgeOrnament(doc, W / 2, H - 6, Math.PI);
  drawEdgeOrnament(doc, 6, H / 2, Math.PI / 2);
  drawEdgeOrnament(doc, W - 6, H / 2, -Math.PI / 2);
}

async function flipImage(dataUrl: string, flipH: boolean, flipV: boolean): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.translate(flipH ? img.width : 0, flipV ? img.height : 0);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = dataUrl;
  });
}

function drawEdgeOrnament(doc: jsPDF, x: number, y: number, _angle: number) {
  fc(doc, C.brandGold);
  // Diamond shape
  const s = 2.5;
  doc.triangle(x, y - s, x + s, y, x, y + s, "F");
  doc.triangle(x, y - s, x - s, y, x, y + s, "F");
  // Small flanking dots
  dc(doc, C.brandGold);
  doc.circle(x - 5, y, 0.8, "F");
  doc.circle(x + 5, y, 0.8, "F");
}

function drawDivider(doc: jsPDF, cx: number, y: number, hw: number) {
  dc(doc, C.brandGold);
  doc.setLineWidth(0.3);
  doc.line(cx - hw, y, cx - 4, y);
  doc.line(cx + 4, y, cx + hw, y);
  // Center diamond
  fc(doc, C.brandGold);
  const s = 1.8;
  doc.triangle(cx, y - s, cx + s, y, cx, y + s, "F");
  doc.triangle(cx, y - s, cx - s, y, cx, y + s, "F");
  // Small dots
  doc.circle(cx - hw + 2, y, 0.5, "F");
  doc.circle(cx + hw - 2, y, 0.5, "F");
}

function drawSeal(doc: jsPDF, x: number, y: number, r: number) {
  // Outer serrated ring
  dc(doc, C.brandGold);
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    doc.setLineWidth(0.4);
    doc.line(
      x + Math.cos(a) * (r - 1), y + Math.sin(a) * (r - 1),
      x + Math.cos(a) * (r + 2), y + Math.sin(a) * (r + 2)
    );
  }

  // Outer circle
  doc.setLineWidth(1.0);
  dc(doc, C.brandGold);
  doc.circle(x, y, r, "S");

  // Inner rings
  doc.setLineWidth(0.5);
  doc.circle(x, y, r - 2, "S");

  // Filled inner circle
  fc(doc, C.bgDark);
  doc.circle(x, y, r - 3.5, "F");
  dc(doc, C.brandGold);
  doc.setLineWidth(0.4);
  doc.circle(x, y, r - 3.5, "S");
  doc.circle(x, y, r - 5, "S");

  // Text inside seal
  doc.setFont("helvetica", "bold");
  tc(doc, C.brandGold);
  doc.setFontSize(7);
  doc.text("CURSO", x, y - 3, { align: "center" });
  doc.text("LIVRE", x, y + 2, { align: "center" });
  doc.setFontSize(4.5);
  doc.text("CERTIFICADO", x, y + 6, { align: "center" });
}

function drawBgPattern(doc: jsPDF, W: number, H: number) {
  doc.setDrawColor(18, 22, 38);
  doc.setLineWidth(0.06);
  for (let i = -H; i < W + H; i += 14) {
    doc.line(i, 0, i + H, H);
  }
}

function safe(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[^\x00-\xFF]/g, "").trim();
}

export async function generateCertificatePDF(data: CertificateData, _siteUrl: string) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;
  const verifyUrl = `${PUBLISHED_URL}/verificar-certificado?code=${data.verificationCode}`;

  const [logoDataUrl, qrDataUrl, cornerDataUrl] = await Promise.all([
    loadImg(logoImg),
    QRCode.toDataURL(verifyUrl, { width: 400, margin: 1 }).catch(() => null),
    loadImg(cornerImg),
  ]);

  // ==================== FRONT PAGE ====================
  fc(doc, C.bgDark);
  doc.rect(0, 0, W, H, "F");
  drawBgPattern(doc, W, H);
  await drawOrnamentalBorder(doc, W, H, cornerDataUrl);

  // Logo
  doc.addImage(logoDataUrl, "PNG", W / 2 - 22, 14, 44, 44);

  // Title
  doc.setFontSize(34);
  doc.setFont("helvetica", "bold");
  tc(doc, C.brandGold);
  doc.text("CERTIFICADO DE CONCLUSAO", W / 2, 68, { align: "center" });

  // Subtitle
  doc.setFontSize(15);
  doc.setFont("helvetica", "italic");
  tc(doc, C.cream);
  doc.text("Curso Livre de Educacao Financeira Familiar", W / 2, 76, { align: "center" });

  drawDivider(doc, W / 2, 81, 85);

  // "Certificamos que"
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  tc(doc, C.muted);
  doc.text("Certificamos que", W / 2, 89, { align: "center" });

  // Student name
  doc.setFontSize(28);
  doc.setFont("helvetica", "bolditalic");
  tc(doc, C.white);
  doc.text(safe(data.userName.toUpperCase()), W / 2, 101, { align: "center" });

  // Underline below name
  dc(doc, C.brandGold);
  doc.setLineWidth(0.4);
  const nameWidth = doc.getTextWidth(safe(data.userName.toUpperCase()));
  doc.line(W / 2 - nameWidth / 2, 103, W / 2 + nameWidth / 2, 103);

  // CPF
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  tc(doc, C.muted);
  doc.text(`CPF: ${formatCPF(data.userCpf)}`, W / 2, 110, { align: "center" });

  // Body text
  const studyTimeStr = formatStudyTime(data.studyHoursTotal);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  tc(doc, C.cream);
  const body = safe(
    `concluiu com exito o Curso Livre de Educacao Financeira Familiar oferecido pelo ${COMPANY} (CNPJ: ${CNPJ}), com carga horaria total de ${studyTimeStr}, em reconhecimento ao seu empenho e dedicacao aos estudos.`
  );
  const bLines = doc.splitTextToSize(body, 210);
  doc.text(bLines, W / 2, 118, { align: "center" });

  // Curso livre notice
  doc.setFontSize(8);
  tc(doc, C.muted);
  doc.text(
    safe("Este certificado refere-se a um Curso Livre conforme Lei n. 9.394/96, Art. 42."),
    W / 2, 134, { align: "center" }
  );

  // Date
  doc.setFontSize(11);
  tc(doc, C.cream);
  doc.text(`Data de Conclusao: ${data.completionDate}`, W / 2, 141, { align: "center" });

  drawDivider(doc, W / 2, 146, 70);

  // Signatures
  const sigY = 168;
  // Left — student
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  tc(doc, C.white);
  doc.text(safe(data.userName), 80, sigY - 5, { align: "center" });
  dc(doc, C.brandGold);
  doc.setLineWidth(0.4);
  doc.line(45, sigY, 115, sigY);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  tc(doc, C.muted);
  doc.text("Nome do Aluno", 80, sigY + 5, { align: "center" });

  // Right — company
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  tc(doc, C.white);
  doc.text(COMPANY, W - 80, sigY - 5, { align: "center" });
  dc(doc, C.brandGold);
  doc.line(W - 115, sigY, W - 45, sigY);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  tc(doc, C.muted);
  doc.text("Coordenacao", W - 80, sigY + 5, { align: "center" });

  // Center seal between signatures
  drawSeal(doc, W / 2, sigY - 3, 16);

  // QR Code bottom right
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, "PNG", W - 42, H - 40, 24, 24);
    doc.setFontSize(5.5);
    tc(doc, C.muted);
    doc.text("Validar Certificado", W - 30, H - 14, { align: "center" });
  }

  // Verification code bottom left
  doc.setFontSize(6);
  tc(doc, C.muted);
  doc.text(`Codigo: ${data.verificationCode}`, 38, H - 16, { align: "center" });

  // ==================== BACK PAGE ====================
  doc.addPage("a4", "landscape");
  fc(doc, C.bgDark);
  doc.rect(0, 0, W, H, "F");
  drawBgPattern(doc, W, H);
  drawOrnamentalBorder(doc, W, H);

  // Title
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  tc(doc, C.brandGold);
  doc.text("CONTEUDO PROGRAMATICO", W / 2, 24, { align: "center" });

  // Student info
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  tc(doc, C.muted);
  doc.text(safe(`Aluno(a): ${data.userName}  |  Codigo: ${data.verificationCode}`), W / 2, 32, { align: "center" });

  drawDivider(doc, W / 2, 36, 110);

  // ---- MODULES 2x2 grid with boxes ----
  const modLabels: Record<string, string> = {
    iniciante: "Fundamentos Financeiros",
    organizado: "Planejamento e Orcamento",
    investidor: "Investimentos Basicos",
    independente: "Protecao Financeira",
  };

  const modTopics: Record<string, string[]> = {
    iniciante: [
      "Por que o dinheiro acaba antes do mes",
      "Como sobreviver com salario minimo",
      "Reserva de emergencia na vida real",
      "O que sao juros e como te afetam",
      "Como fazer um orcamento simples",
      "Diferenca entre querer e precisar",
      "Como evitar o cheque especial",
      "Metas financeiras: como definir",
      "Conversar sobre dinheiro em familia",
      "Golpes financeiros: protecao",
    ],
    organizado: [
      "Divida nao e sentenca de morte",
      "Compra por impulso: como parar",
      "Pix parcelado e cartao: armadilhas",
      "Metodo bola de neve para dividas",
      "Como economizar no supermercado",
      "Contas fixas: como reduzir",
      "Renda extra: ideias praticas",
      "Direitos do consumidor endividado",
      "Apps financeiros gratuitos",
      "Planejamento mensal eficiente",
    ],
    investidor: [
      "Poupanca vs CDB vs Tesouro",
      "Como funciona a bolsa de valores",
      "Renda fixa para iniciantes",
      "Fundos de investimento",
      "Como avaliar riscos",
      "Imposto de renda: investimentos",
      "Previdencia privada: vale a pena?",
      "Diversificacao de carteira",
      "Investir com pouco dinheiro",
      "Erros comuns ao investir",
    ],
    independente: [
      "Independencia financeira: conceito",
      "Renda passiva: como construir",
      "Imoveis como investimento",
      "Empreendedorismo e financas",
      "Planejamento para aposentadoria",
      "Heranca e planejamento sucessorio",
      "Educacao financeira para filhos",
      "Protecao patrimonial: seguros",
      "Filantropia e impacto social",
      "Seu plano de liberdade financeira",
    ],
  };

  const keys = Object.keys(modLabels);
  const colWidth = 63;
  const colGap = 5;
  const totalGridW = colWidth * 4 + colGap * 3;
  const gridStartX = (W - totalGridW) / 2;
  const gridStartY = 40;

  keys.forEach((key, idx) => {
    const colX = gridStartX + idx * (colWidth + colGap);

    // Module header box with green background
    fc(doc, C.brandGreen);
    doc.roundedRect(colX, gridStartY, colWidth, 8, 1, 1, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    tc(doc, C.white);
    doc.text(modLabels[key], colX + colWidth / 2, gridStartY + 5.5, { align: "center" });

    // Content box
    dc(doc, C.brandGold);
    doc.setLineWidth(0.3);
    doc.roundedRect(colX, gridStartY + 8, colWidth, 48, 1, 1, "S");

    // Topics
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    tc(doc, C.cream);
    (modTopics[key] || []).forEach((topic, i) => {
      const num = `${i + 1}.`;
      doc.setFont("helvetica", "bold");
      tc(doc, C.brandGold);
      doc.text(num, colX + 2, gridStartY + 13 + i * 4.5);
      doc.setFont("helvetica", "normal");
      tc(doc, C.cream);
      const truncated = topic.length > 30 ? topic.substring(0, 28) + "..." : topic;
      doc.text(truncated, colX + 7, gridStartY + 13 + i * 4.5);
    });
  });

  // ---- MISSIONS ----
  const missionsStartY = 102;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  tc(doc, C.brandGold);
  doc.text("MISSOES CONCLUIDAS", W / 2, missionsStartY, { align: "center" });

  drawDivider(doc, W / 2, missionsStartY + 4, 60);

  const missions = data.missionsCompleted.map(m => safe(m));
  const missionCols = 4;
  const perCol = Math.ceil(missions.length / missionCols);
  const mColWidth = 60;
  const mTotalW = mColWidth * missionCols + 8 * (missionCols - 1);
  const mStartX = (W - mTotalW) / 2;

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  tc(doc, C.cream);
  missions.forEach((m, i) => {
    const ci = Math.floor(i / perCol);
    const row = i % perCol;
    const x = mStartX + ci * (mColWidth + 8);
    // Bullet
    fc(doc, C.brandGreen);
    doc.circle(x + 1, missionsStartY + 9 + row * 4.2 - 0.5, 0.7, "F");
    // Text
    tc(doc, C.cream);
    const truncated = m.length > 30 ? m.substring(0, 28) + "..." : m;
    doc.text(truncated, x + 4, missionsStartY + 9 + row * 4.2);
  });

  // ---- FOOTER ----
  // QR code bottom right
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, "PNG", W - 42, H - 40, 24, 24);
    doc.setFontSize(5.5);
    tc(doc, C.muted);
    doc.text("Validar Certificado", W - 30, H - 14, { align: "center" });
  }

  // Social media
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  tc(doc, C.brandGold);
  doc.text("Siga-nos:", W / 2, H - 28, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  tc(doc, C.white);
  doc.text("Instagram: @futurorealbrasil   |   YouTube: Futuro Real Brasil", W / 2, H - 23, { align: "center" });

  doc.setFontSize(7);
  tc(doc, C.muted);
  doc.text(
    "Este certificado refere-se a um Curso Livre, conforme Lei n. 9.394/96, Art. 42. Nao substitui cursos tecnicos, de graduacao ou pos-graduacao.",
    W / 2, H - 17, { align: "center" }
  );

  doc.setFontSize(7);
  tc(doc, C.muted);
  doc.text(
    `Codigo de Verificacao: ${data.verificationCode}  |  Verifique em: ${PUBLISHED_URL}/verificar-certificado`,
    W / 2, H - 13, { align: "center" }
  );

  doc.save(`certificado-${data.verificationCode}.pdf`);
}
