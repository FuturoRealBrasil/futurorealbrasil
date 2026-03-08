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

const C = {
  bgDark: [10, 13, 22] as [number, number, number],
  brandBlue: [45, 110, 195] as [number, number, number],
  brandGreen: [46, 160, 105] as [number, number, number],
  brandGold: [235, 175, 35] as [number, number, number],
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

// ---- Decorative helpers ----

function drawStripes(doc: jsPDF, W: number, y: number, dir: 1 | -1) {
  const colors = [C.brandGreen, C.brandGold, C.brandBlue];
  const heights = [2.5, 1.2, 1.8];
  let offset = 0;
  const order = dir === 1 ? colors : [...colors].reverse();
  const hOrder = dir === 1 ? heights : [...heights].reverse();
  for (let i = 0; i < 3; i++) {
    fc(doc, order[i]);
    doc.rect(0, y + offset, W, hOrder[i], "F");
    offset += hOrder[i];
  }
}

function drawBorder(doc: jsPDF, W: number, H: number) {
  dc(doc, C.brandGold);
  doc.setLineWidth(1.4);
  doc.rect(7, 7, W - 14, H - 14);
  doc.setLineWidth(0.4);
  doc.rect(11, 11, W - 22, H - 22);

  // Corner L-brackets with dots
  const len = 20;
  doc.setLineWidth(0.9);
  [
    [7, 7, 1, 1], [W - 7, 7, -1, 1],
    [7, H - 7, 1, -1], [W - 7, H - 7, -1, -1],
  ].forEach(([x, y, dx, dy]) => {
    doc.line(x, y, x + dx * len, y);
    doc.line(x, y, x, y + dy * len);
    fc(doc, C.brandGold);
    doc.circle(x + dx * 3.5, y + dy * 3.5, 1, "F");
  });

  // Edge center dots
  fc(doc, C.brandGold);
  doc.circle(W / 2, 7, 1.2, "F");
  doc.circle(W / 2, H - 7, 1.2, "F");
  doc.circle(7, H / 2, 1.2, "F");
  doc.circle(W - 7, H / 2, 1.2, "F");
}

function drawDivider(doc: jsPDF, cx: number, y: number, hw: number) {
  dc(doc, C.brandGold);
  doc.setLineWidth(0.3);
  doc.line(cx - hw, y, cx - 3, y);
  doc.line(cx + 3, y, cx + hw, y);
  fc(doc, C.brandGold);
  const s = 1.5;
  doc.triangle(cx, y - s, cx + s, y, cx, y + s, "F");
  doc.triangle(cx, y - s, cx - s, y, cx, y + s, "F");
}

function drawSeal(doc: jsPDF, x: number, y: number, r: number) {
  dc(doc, C.brandGold);
  // Serrated teeth
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    doc.setLineWidth(0.35);
    doc.line(
      x + Math.cos(a) * (r - 1), y + Math.sin(a) * (r - 1),
      x + Math.cos(a) * (r + 1.2), y + Math.sin(a) * (r + 1.2)
    );
  }
  doc.setLineWidth(0.7);
  doc.circle(x, y, r, "S");
  doc.setLineWidth(0.3);
  doc.circle(x, y, r - 2.5, "S");

  fc(doc, C.bgDark);
  doc.circle(x, y, r - 3.5, "F");
  dc(doc, C.brandGold);
  doc.circle(x, y, r - 3.5, "S");

  doc.setFont("helvetica", "bold");
  tc(doc, C.brandGold);
  doc.setFontSize(5.5);
  doc.text("CURSO", x, y - 3, { align: "center" });
  doc.text("LIVRE", x, y + 1.5, { align: "center" });
  doc.setFontSize(3.5);
  doc.text("CERTIFICADO", x, y + 5, { align: "center" });
}

function drawBgPattern(doc: jsPDF, W: number, H: number) {
  doc.setDrawColor(22, 27, 42);
  doc.setLineWidth(0.08);
  for (let i = -H; i < W + H; i += 14) {
    doc.line(i, 0, i + H, H);
  }
}

// Strip any non-latin1 characters (emojis, etc.) that jsPDF can't render
function safe(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[^\x00-\xFF]/g, "").trim();
}

export async function generateCertificatePDF(data: CertificateData, _siteUrl: string) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;
  const verifyUrl = `${PUBLISHED_URL}/verificar-certificado?code=${data.verificationCode}`;

  const [logoDataUrl, qrDataUrl] = await Promise.all([
    loadImg(logoImg),
    QRCode.toDataURL(verifyUrl, { width: 400, margin: 1 }).catch(() => null),
  ]);

  // ==================== FRONT PAGE ====================
  fc(doc, C.bgDark);
  doc.rect(0, 0, W, H, "F");
  drawBgPattern(doc, W, H);
  drawBorder(doc, W, H);

  // Logo — large
  doc.addImage(logoDataUrl, "PNG", W / 2 - 20, 10, 40, 40);

  // Title
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  tc(doc, C.brandGold);
  doc.text("CERTIFICADO DE CONCLUSAO", W / 2, 60, { align: "center" });

  // Subtitle
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  tc(doc, C.muted);
  doc.text("Curso Livre de Educacao Financeira Familiar", W / 2, 69, { align: "center" });

  drawDivider(doc, W / 2, 74, 75);

  // "Certificamos que"
  doc.setFontSize(15);
  doc.setFont("helvetica", "normal");
  tc(doc, C.cream);
  doc.text("Certificamos que", W / 2, 83, { align: "center" });

  // Student name — large
  doc.setFontSize(30);
  doc.setFont("helvetica", "bolditalic");
  tc(doc, C.white);
  doc.text(safe(data.userName.toUpperCase()), W / 2, 96, { align: "center" });

  drawDivider(doc, W / 2, 100, 80);

  // CPF
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  tc(doc, C.muted);
  doc.text(`CPF: ${formatCPF(data.userCpf)}`, W / 2, 107, { align: "center" });

  // Body text
  const studyTimeStr = formatStudyTime(data.studyHoursTotal);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  tc(doc, C.cream);
  const body = safe(
    `concluiu com exito o Curso Livre de Educacao Financeira Familiar oferecido pelo ${COMPANY} (CNPJ: ${CNPJ}), com carga horaria total de ${studyTimeStr}, em reconhecimento ao seu empenho e dedicacao aos estudos.`
  );
  const bLines = doc.splitTextToSize(body, 220);
  doc.text(bLines, W / 2, 116, { align: "center" });

  // Curso livre notice
  doc.setFontSize(9);
  tc(doc, C.muted);
  doc.text(
    safe("Este certificado refere-se a um Curso Livre conforme Lei n. 9.394/96, Art. 42."),
    W / 2, 136, { align: "center" }
  );

  // Date
  doc.setFontSize(11);
  tc(doc, C.cream);
  doc.text(`Data de Conclusao: ${data.completionDate}`, W / 2, 144, { align: "center" });

  drawDivider(doc, W / 2, 148, 65);

  // Signatures
  const sigY = 170;
  // Left — student
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  tc(doc, C.white);
  doc.text(safe(data.userName), 80, sigY - 5, { align: "center" });
  dc(doc, C.brandGold);
  doc.setLineWidth(0.3);
  doc.line(50, sigY, 110, sigY);
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
  doc.line(W - 110, sigY, W - 50, sigY);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  tc(doc, C.muted);
  doc.text("Coordenacao", W - 80, sigY + 5, { align: "center" });

  // Seal — centered
  drawSeal(doc, W / 2, sigY - 2, 15);

  // QR Code
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, "PNG", W - 44, H - 42, 24, 24);
    doc.setFontSize(5.5);
    tc(doc, C.muted);
    doc.text("Validar Certificado", W - 32, H - 16, { align: "center" });
  }

  // Verification code
  doc.setFontSize(6);
  tc(doc, C.muted);
  doc.text(`Codigo: ${data.verificationCode}`, 38, H - 18, { align: "center" });

  // ==================== BACK PAGE ====================
  doc.addPage("a4", "landscape");
  fc(doc, C.bgDark);
  doc.rect(0, 0, W, H, "F");
  drawBgPattern(doc, W, H);
  drawBorder(doc, W, H);

  // Title
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  tc(doc, C.brandGold);
  doc.text("CONTEUDO PROGRAMATICO", W / 2, 22, { align: "center" });

  // Student info
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  tc(doc, C.muted);
  doc.text(safe(`Aluno(a): ${data.userName}  |  Codigo: ${data.verificationCode}`), W / 2, 30, { align: "center" });

  drawDivider(doc, W / 2, 34, 105);

  // ---- MODULES 2x2 ----
  const modLabels: Record<string, string> = {
    iniciante: "MODULO INICIANTE",
    organizado: "MODULO ORGANIZADO",
    investidor: "MODULO INVESTIDOR",
    independente: "MODULO INDEPENDENTE",
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

  const lCol = 20;
  const rCol = W / 2 + 8;
  const keys = Object.keys(modLabels);

  keys.forEach((key, idx) => {
    const col = idx % 2 === 0 ? lCol : rCol;
    const startY = idx < 2 ? 39 : 86;

    // Module title
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    tc(doc, C.brandGreen);
    doc.text(modLabels[key], col, startY);

    // Underline
    dc(doc, C.brandGreen);
    doc.setLineWidth(0.3);
    doc.line(col, startY + 1.5, col + 65, startY + 1.5);

    // Topics
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    tc(doc, C.cream);
    (modTopics[key] || []).forEach((topic, i) => {
      doc.text(`-  ${topic}`, col + 1, startY + 6 + i * 3.8);
    });
  });

  // ---- MISSIONS ----
  const missionsStartY = 132;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  tc(doc, C.brandGold);
  doc.text("MISSOES CONCLUIDAS", W / 2, missionsStartY, { align: "center" });

  drawDivider(doc, W / 2, missionsStartY + 3, 55);

  const missions = data.missionsCompleted.map(m => safe(m));
  const perCol = Math.ceil(missions.length / 3);
  const mCols = [25, W / 3 + 10, (2 * W) / 3 - 5];

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  tc(doc, C.cream);
  missions.forEach((m, i) => {
    const ci = Math.floor(i / perCol);
    const row = i % perCol;
    doc.text(`-  ${m}`, mCols[Math.min(ci, 2)], missionsStartY + 8 + row * 3.8);
  });

  // ---- SOCIAL & FOOTER ----
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  tc(doc, C.brandGold);
  doc.text("Siga-nos:", W / 2, H - 26, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  tc(doc, C.white);
  doc.text("Instagram: @futurorealbrasil   |   YouTube: Futuro Real Brasil", W / 2, H - 21, { align: "center" });

  doc.setFontSize(7);
  tc(doc, C.muted);
  doc.text(
    "Este certificado refere-se a um Curso Livre, conforme Lei n. 9.394/96, Art. 42. Nao substitui cursos tecnicos, de graduacao ou pos-graduacao.",
    W / 2, H - 16, { align: "center" }
  );

  doc.setFontSize(7);
  tc(doc, C.muted);
  doc.text(
    `Codigo de Verificacao: ${data.verificationCode}  |  Verifique em: ${PUBLISHED_URL}/verificar-certificado`,
    W / 2, H - 13, { align: "center" }
  );

  doc.save(`certificado-${data.verificationCode}.pdf`);
}
