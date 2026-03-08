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

// Site dark theme colors (RGB)
const COLORS = {
  bgDark: [14, 18, 27] as [number, number, number],
  bgCard: [22, 28, 40] as [number, number, number],
  brandBlue: [40, 100, 180] as [number, number, number],
  brandGreen: [51, 153, 102] as [number, number, number],
  brandGold: [245, 180, 30] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  lightGray: [200, 210, 220] as [number, number, number],
  mutedText: [140, 150, 170] as [number, number, number],
};

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

function setColor(doc: jsPDF, color: [number, number, number]) {
  doc.setTextColor(color[0], color[1], color[2]);
}

function drawGoldBorder(doc: jsPDF, W: number, H: number) {
  const [r, g, b] = COLORS.brandGold;
  // Outer border
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(1.5);
  doc.rect(8, 8, W - 16, H - 16);
  // Inner border
  doc.setLineWidth(0.5);
  doc.rect(12, 12, W - 24, H - 24);
  // Corner accents
  const cornerLen = 15;
  doc.setLineWidth(1);
  // Top-left
  doc.line(8, 8, 8 + cornerLen, 8);
  doc.line(8, 8, 8, 8 + cornerLen);
  // Top-right
  doc.line(W - 8, 8, W - 8 - cornerLen, 8);
  doc.line(W - 8, 8, W - 8, 8 + cornerLen);
  // Bottom-left
  doc.line(8, H - 8, 8 + cornerLen, H - 8);
  doc.line(8, H - 8, 8, H - 8 - cornerLen);
  // Bottom-right
  doc.line(W - 8, H - 8, W - 8 - cornerLen, H - 8);
  doc.line(W - 8, H - 8, W - 8, H - 8 - cornerLen);
}

function drawSeal(doc: jsPDF, x: number, y: number, radius: number) {
  const [r, g, b] = COLORS.brandGold;
  // Outer star-burst seal
  doc.setDrawColor(r, g, b);
  doc.setFillColor(r, g, b);
  
  // Draw circle
  doc.setLineWidth(0.8);
  doc.circle(x, y, radius, "S");
  doc.circle(x, y, radius - 1.5, "S");
  
  // Inner circle with fill
  doc.setFillColor(COLORS.bgDark[0], COLORS.bgDark[1], COLORS.bgDark[2]);
  doc.circle(x, y, radius - 3, "F");
  doc.setDrawColor(r, g, b);
  doc.circle(x, y, radius - 3, "S");
  
  // Seal text
  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  setColor(doc, COLORS.brandGold);
  doc.text("CURSO", x, y - 3, { align: "center" });
  doc.text("LIVRE", x, y + 0.5, { align: "center" });
  doc.setFontSize(3.5);
  doc.text("CERTIFICADO", x, y + 4, { align: "center" });
}

function drawSignatureLine(doc: jsPDF, x: number, y: number, width: number, label: string, name: string) {
  // Name above line
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  setColor(doc, COLORS.white);
  doc.text(name, x, y - 3, { align: "center" });
  
  // Line
  doc.setDrawColor(COLORS.brandGold[0], COLORS.brandGold[1], COLORS.brandGold[2]);
  doc.setLineWidth(0.3);
  doc.line(x - width / 2, y, x + width / 2, y);
  
  // Label below line
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  setColor(doc, COLORS.mutedText);
  doc.text(label, x, y + 4, { align: "center" });
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
  // Dark background
  doc.setFillColor(COLORS.bgDark[0], COLORS.bgDark[1], COLORS.bgDark[2]);
  doc.rect(0, 0, W, H, "F");

  // Subtle gradient bar at top
  doc.setFillColor(COLORS.brandBlue[0], COLORS.brandBlue[1], COLORS.brandBlue[2]);
  doc.rect(0, 0, W, 3, "F");
  doc.setFillColor(COLORS.brandGreen[0], COLORS.brandGreen[1], COLORS.brandGreen[2]);
  doc.rect(0, 3, W, 1.5, "F");
  doc.setFillColor(COLORS.brandGold[0], COLORS.brandGold[1], COLORS.brandGold[2]);
  doc.rect(0, 4.5, W, 1, "F");

  // Gold border
  drawGoldBorder(doc, W, H);

  // Logo centered at top
  doc.addImage(logoDataUrl, "PNG", W / 2 - 15, 14, 30, 30);

  // Title
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  setColor(doc, COLORS.brandGold);
  doc.text("CERTIFICADO DE CONCLUSÃO", W / 2, 55, { align: "center" });

  // Subtitle - Curso Livre
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  setColor(doc, COLORS.mutedText);
  doc.text("Curso Livre de Educação Financeira", W / 2, 62, { align: "center" });

  // Decorative line
  doc.setDrawColor(COLORS.brandGold[0], COLORS.brandGold[1], COLORS.brandGold[2]);
  doc.setLineWidth(0.4);
  doc.line(W / 2 - 60, 66, W / 2 + 60, 66);

  // "Certificamos que"
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  setColor(doc, COLORS.lightGray);
  doc.text("Certificamos que", W / 2, 76, { align: "center" });

  // Student name
  const fullName = data.userName.toUpperCase();
  doc.setFontSize(20);
  doc.setFont("helvetica", "bolditalic");
  setColor(doc, COLORS.white);
  doc.text(fullName, W / 2, 87, { align: "center" });

  // CPF
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  setColor(doc, COLORS.mutedText);
  doc.text(`CPF: ${formatCPF(data.userCpf)}`, W / 2, 93, { align: "center" });

  // Body text
  const studyTimeStr = formatStudyTime(data.studyHoursTotal);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  setColor(doc, COLORS.lightGray);
  const bodyText = `concluiu com êxito o Curso Livre de Educação Financeira Familiar oferecido pelo ${COMPANY} (CNPJ: ${CNPJ}), com carga horária total de ${studyTimeStr}, em reconhecimento ao seu empenho e dedicação aos estudos. Este certificado não possui valor de curso técnico ou graduação, sendo referente a um Curso Livre conforme Lei nº 9.394/96.`;
  const bodyLines = doc.splitTextToSize(bodyText, 200);
  doc.text(bodyLines, W / 2, 102, { align: "center" });

  // Date
  doc.setFontSize(8);
  setColor(doc, COLORS.mutedText);
  doc.text(`Data de Conclusão: ${data.completionDate}`, W / 2, 130, { align: "center" });

  // Signatures
  drawSignatureLine(doc, 95, 155, 60, "Nome do Aluno", data.userName);
  drawSignatureLine(doc, 200, 155, 60, "Coordenação", COMPANY);

  // Seal
  drawSeal(doc, W / 2, 152, 12);

  // QR Code bottom-right
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, "PNG", W - 44, H - 40, 24, 24);
    doc.setFontSize(5);
    setColor(doc, COLORS.mutedText);
    doc.text("Validar", W - 32, H - 14, { align: "center" });
  }

  // Verification code bottom-left
  doc.setFontSize(6);
  setColor(doc, COLORS.mutedText);
  doc.text(`Código: ${data.verificationCode}`, 40, H - 16, { align: "center" });

  // Bottom bars
  doc.setFillColor(COLORS.brandGold[0], COLORS.brandGold[1], COLORS.brandGold[2]);
  doc.rect(0, H - 1, W, 1, "F");
  doc.setFillColor(COLORS.brandGreen[0], COLORS.brandGreen[1], COLORS.brandGreen[2]);
  doc.rect(0, H - 2.5, W, 1.5, "F");
  doc.setFillColor(COLORS.brandBlue[0], COLORS.brandBlue[1], COLORS.brandBlue[2]);
  doc.rect(0, H - 5.5, W, 3, "F");

  // ==================== BACK PAGE ====================
  doc.addPage("a4", "landscape");

  // Dark background
  doc.setFillColor(COLORS.bgDark[0], COLORS.bgDark[1], COLORS.bgDark[2]);
  doc.rect(0, 0, W, H, "F");

  // Top bars
  doc.setFillColor(COLORS.brandBlue[0], COLORS.brandBlue[1], COLORS.brandBlue[2]);
  doc.rect(0, 0, W, 3, "F");
  doc.setFillColor(COLORS.brandGreen[0], COLORS.brandGreen[1], COLORS.brandGreen[2]);
  doc.rect(0, 3, W, 1.5, "F");
  doc.setFillColor(COLORS.brandGold[0], COLORS.brandGold[1], COLORS.brandGold[2]);
  doc.rect(0, 4.5, W, 1, "F");

  drawGoldBorder(doc, W, H);

  // Logo small top
  doc.addImage(logoDataUrl, "PNG", W / 2 - 10, 10, 20, 20);

  // Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  setColor(doc, COLORS.brandGold);
  doc.text("CONTEÚDO PROGRAMÁTICO", W / 2, 38, { align: "center" });

  // Student info
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  setColor(doc, COLORS.mutedText);
  doc.text(`Aluno(a): ${data.userName}  |  Código: ${data.verificationCode}`, W / 2, 44, { align: "center" });

  // Decorative line
  doc.setDrawColor(COLORS.brandGold[0], COLORS.brandGold[1], COLORS.brandGold[2]);
  doc.setLineWidth(0.3);
  doc.line(20, 47, W - 20, 47);

  // ---- MODULES SECTION ----
  const moduleLabels: Record<string, string> = {
    iniciante: "🌱 Módulo Iniciante",
    organizado: "📋 Módulo Organizado",
    investidor: "📈 Módulo Investidor",
    independente: "🏆 Módulo Independente",
  };

  // Module topics - complete list
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

  let yPos = 52;
  const colWidth = 130;
  const leftCol = 22;
  const rightCol = W / 2 + 5;

  const moduleKeys = Object.keys(moduleLabels);

  moduleKeys.forEach((key, idx) => {
    const col = idx % 2 === 0 ? leftCol : rightCol;
    const startY = idx < 2 ? 52 : 118;

    // Module title
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    setColor(doc, COLORS.brandGreen);
    doc.text(moduleLabels[key], col, startY);

    // Topics
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "normal");
    setColor(doc, COLORS.lightGray);
    const topics = moduleTopics[key] || [];
    topics.forEach((topic, i) => {
      doc.text(`• ${topic}`, col + 2, startY + 5 + i * 4.5);
    });
  });

  // ---- MISSIONS SECTION ----
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  setColor(doc, COLORS.brandGold);
  doc.text("MISSÕES CONCLUÍDAS", W / 2, 170, { align: "center" });

  doc.setDrawColor(COLORS.brandGold[0], COLORS.brandGold[1], COLORS.brandGold[2]);
  doc.setLineWidth(0.2);
  doc.line(60, 172, W - 60, 172);

  // List missions in 2 columns
  doc.setFontSize(5);
  doc.setFont("helvetica", "normal");
  setColor(doc, COLORS.lightGray);
  const missions = data.missionsCompleted;
  const midpoint = Math.ceil(missions.length / 2);
  const missionLeftCol = 30;
  const missionRightCol = W / 2 + 10;

  missions.forEach((mission, i) => {
    const col = i < midpoint ? missionLeftCol : missionRightCol;
    const row = i < midpoint ? i : i - midpoint;
    doc.text(`✓ ${mission}`, col, 176 + row * 3.5);
  });

  // ---- SOCIAL MEDIA & FOOTER ----
  // Bottom bars
  doc.setFillColor(COLORS.brandGold[0], COLORS.brandGold[1], COLORS.brandGold[2]);
  doc.rect(0, H - 1, W, 1, "F");
  doc.setFillColor(COLORS.brandGreen[0], COLORS.brandGreen[1], COLORS.brandGreen[2]);
  doc.rect(0, H - 2.5, W, 1.5, "F");
  doc.setFillColor(COLORS.brandBlue[0], COLORS.brandBlue[1], COLORS.brandBlue[2]);
  doc.rect(0, H - 5.5, W, 3, "F");

  // Social media info
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  setColor(doc, COLORS.brandGold);
  doc.text("Siga-nos nas redes sociais:", W / 2, H - 22, { align: "center" });

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  setColor(doc, COLORS.white);
  doc.text("Instagram: @futurorealbrasil  |  YouTube: Futuro Real Brasil", W / 2, H - 17, { align: "center" });

  // Curso livre notice
  doc.setFontSize(5);
  setColor(doc, COLORS.mutedText);
  doc.text("Este certificado refere-se a um Curso Livre, conforme Lei nº 9.394/96, Art. 42. Não substitui cursos técnicos, de graduação ou pós-graduação.", W / 2, H - 10, { align: "center" });

  // Verification code
  doc.setFontSize(5);
  setColor(doc, COLORS.mutedText);
  doc.text(`Código de Verificação: ${data.verificationCode}  |  Verifique em: ${PUBLISHED_URL}/verificar-certificado`, W / 2, H - 7, { align: "center" });

  doc.save(`certificado-${data.verificationCode}.pdf`);
}
