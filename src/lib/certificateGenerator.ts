import jsPDF from "jspdf";
import QRCode from "qrcode";
import certFrenteImg from "@/assets/certificado-frente.png";
import certVersoImg from "@/assets/certificado-verso.png";

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

// Regions to clear on the front template (relative percentages of image dimensions)
// Each region: [xPercent, yPercent, widthPercent, heightPercent]
const FRONT_CLEAR_REGIONS = [
  // "Nome do(a) Aluno(a)" placeholder text area
  [0.185, 0.465, 0.63, 0.065],
  // "Certificamos que..." body text area
  [0.12, 0.545, 0.76, 0.1],
  // Left signature name area (below "Nome do Instrutor")
  [0.22, 0.72, 0.2, 0.045],
  // Right signature name area (below "Nome do Coordenador")
  [0.55, 0.72, 0.2, 0.045],
];

// Load image, clear specified regions by sampling surrounding pixels, return data URL
async function loadAndCleanImage(src: string, clearRegions: number[][] = []): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      // Clear each region by sampling color from nearby pixels
      for (const [xPct, yPct, wPct, hPct] of clearRegions) {
        const x = Math.floor(xPct * canvas.width);
        const y = Math.floor(yPct * canvas.height);
        const w = Math.floor(wPct * canvas.width);
        const h = Math.floor(hPct * canvas.height);

        // Sample color from top-left corner of region (background color)
        const sampleX = Math.max(0, x - 5);
        const sampleY = Math.max(0, y + Math.floor(h / 2));
        const pixel = ctx.getImageData(sampleX, sampleY, 1, 1).data;

        ctx.fillStyle = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
        ctx.fillRect(x, y, w, h);
      }

      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = src;
  });
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

// All 40 course topics organized by module
const COURSE_MODULES = {
  "Modulo 1 - Iniciante": [
    "O que e Educacao Financeira",
    "Renda vs Despesas",
    "Orcamento Familiar",
    "Habitos de Consumo",
    "Economia Domestica",
    "Metas Financeiras",
    "Conta Bancaria Basica",
    "Direitos do Consumidor",
    "Inflacao no Dia a Dia",
    "Primeiros Passos para Poupar",
  ],
  "Modulo 2 - Organizado": [
    "Planejamento Mensal",
    "Controle de Gastos",
    "Fundo de Emergencia",
    "Dividas e Juros",
    "Negociacao de Dividas",
    "Credito Consciente",
    "Compras Inteligentes",
    "Seguros Essenciais",
    "Imposto de Renda Basico",
    "Organizacao Financeira Digital",
  ],
  "Modulo 3 - Investidor": [
    "Introducao aos Investimentos",
    "Renda Fixa",
    "Tesouro Direto",
    "CDB, LCI e LCA",
    "Fundos de Investimento",
    "Acoes para Iniciantes",
    "Diversificacao",
    "Perfil de Investidor",
    "Riscos e Retornos",
    "Previdencia Privada",
  ],
  "Modulo 4 - Independente": [
    "Liberdade Financeira",
    "Renda Passiva",
    "Empreendedorismo",
    "Investimentos Avancados",
    "Protecao Patrimonial",
    "Planejamento Sucessorio",
    "Educacao Financeira Infantil",
    "Financas e Bem-estar",
    "Economia e Sociedade",
    "Seu Plano de Acao",
  ],
};

export async function generateCertificatePDF(data: CertificateData, _siteUrl: string) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;

  const verifyUrl = `${PUBLISHED_URL}/verificar-certificado?code=${data.verificationCode}`;

  // Load front image with cleared placeholder regions, back image as-is, and QR code
  const [frontDataUrl, backDataUrl, qrDataUrl] = await Promise.all([
    loadAndCleanImage(certFrenteImg, FRONT_CLEAR_REGIONS),
    loadImageAsDataUrl(certVersoImg),
    QRCode.toDataURL(verifyUrl, { width: 400, margin: 1 }).catch(() => null),
  ]);

  // ===== FRONT PAGE =====
  doc.addImage(frontDataUrl, "PNG", 0, 0, W, H);

  // Student name - centered on the name line area
  const fullName = data.userName.toUpperCase();
  doc.setFontSize(20);
  doc.setFont("helvetica", "bolditalic");
  doc.setTextColor(40, 30, 20);
  doc.text(fullName, W / 2, 103, { align: "center" });

  // CPF below name
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 70, 55);
  doc.text(`CPF: ${formatCPF(data.userCpf)}`, W / 2, 109, { align: "center" });

  // Body text - certification paragraph
  const studyTimeStr = formatStudyTime(data.studyHoursTotal);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 30, 20);
  const bodyText = `Certificamos que o(a) aluno(a) acima concluiu com exito o curso de Educacao Financeira oferecido pelo ${COMPANY}, com a carga horaria de ${studyTimeStr}, em reconhecimento ao seu empenho e dedicacao aos estudos.`;
  const bodyLines = doc.splitTextToSize(bodyText, 200);
  doc.text(bodyLines, W / 2, 118, { align: "center" });

  // Left signature (Instrutor) - positioned below the line
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(40, 30, 20);
  doc.text("Monteiro", 105, 155, { align: "center" });

  // Right signature (Coordenador)
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(COMPANY, 200, 155, { align: "center" });

  // Date - bottom left inside the frame
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 70, 55);
  doc.text(`Data: ${data.completionDate}`, 55, H - 16, { align: "center" });

  // Verification code - bottom right
  doc.setFontSize(6);
  doc.setTextColor(80, 70, 55);
  doc.text(`Codigo: ${data.verificationCode}`, W - 40, H - 12, { align: "center" });

  // QR Code - bottom right corner over template placeholder
  if (qrDataUrl) {
    doc.setFillColor(255, 255, 255);
    doc.rect(W - 55, H - 48, 30, 30, "F");
    doc.addImage(qrDataUrl, "PNG", W - 54, H - 47, 28, 28);
  }

  // ===== BACK PAGE =====
  doc.addPage("a4", "landscape");
  doc.addImage(backDataUrl, "PNG", 0, 0, W, H);

  // Overlay QR Code on back page
  if (qrDataUrl) {
    doc.setFillColor(255, 255, 255);
    doc.rect(W - 70, 55, 42, 42, "F");
    doc.addImage(qrDataUrl, "PNG", W - 68, 57, 38, 38);
  }

  // Verification URL under QR
  doc.setFontSize(5.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 80, 40);
  doc.text(`${PUBLISHED_URL}/verificar-certificado`, W - 49, 100, { align: "center" });

  // --- Course content overlay on back page ---
  // Clear the generic text areas and write actual course modules
  const contentStartY = 55;
  const leftCol = 30;
  const rightCol = 155;
  const colWidth = 110;

  // Draw a semi-transparent overlay for the content area
  // Use the parchment background color
  doc.setFillColor(222, 213, 185);
  doc.rect(18, contentStartY - 5, 195, 120, "F");

  // Draw border for content area
  doc.setDrawColor(139, 119, 42);
  doc.setLineWidth(0.5);
  doc.rect(18, contentStartY - 5, 195, 120, "S");

  // Title
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 80, 40);
  doc.text("Conteudo Programatico do Curso", W / 2 - 35, contentStartY + 2, { align: "center" });

  doc.setDrawColor(139, 119, 42);
  doc.setLineWidth(0.3);
  doc.line(40, contentStartY + 5, W - 85, contentStartY + 5);

  let y = contentStartY + 12;
  const modules = Object.entries(COURSE_MODULES);

  // Layout: 2 modules per row, 2 rows
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const idx = row * 2 + col;
      if (idx >= modules.length) break;
      const [moduleName, topics] = modules[idx];
      const x = col === 0 ? leftCol : rightCol;
      const currentY = y + row * 55;

      // Module title
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 80, 40);
      doc.text(moduleName, x, currentY);

      // Module underline
      doc.setDrawColor(180, 160, 80);
      doc.setLineWidth(0.2);
      doc.line(x, currentY + 1, x + colWidth, currentY + 1);

      // Topics
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 40, 30);
      for (let t = 0; t < topics.length; t++) {
        const topicY = currentY + 5 + t * 4.5;
        doc.text(`• ${topics[t]}`, x + 2, topicY);
      }
    }
  }

  // Verification code at bottom of back page
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 90, 75);
  doc.text(`Codigo de Verificacao: ${data.verificationCode}`, W / 2, H - 12, { align: "center" });

  doc.save(`certificado-${data.verificationCode}.pdf`);
}
