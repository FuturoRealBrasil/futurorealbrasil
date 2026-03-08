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

// ========== COLOR PALETTE ==========
const FRAME_OUTER: [number, number, number] = [45, 30, 15];
const FRAME_GOLD: [number, number, number] = [180, 150, 60];
const FRAME_INNER: [number, number, number] = [60, 40, 20];
const CREAM_BG: [number, number, number] = [252, 248, 235];
const DARK_GREEN: [number, number, number] = [0, 80, 40];
const BANNER_GREEN: [number, number, number] = [0, 90, 45];
const BANNER_GREEN_LIGHT: [number, number, number] = [30, 120, 60];
const GOLD: [number, number, number] = [200, 165, 50];
const DARK_GOLD: [number, number, number] = [160, 130, 40];
const TEXT_DARK: [number, number, number] = [40, 30, 20];
const TEXT_GRAY: [number, number, number] = [100, 90, 75];
const WHITE: [number, number, number] = [255, 255, 255];

// ========== FRAME DRAWING ==========
function drawOrnateFrame(doc: jsPDF, W: number, H: number) {
  // Outer dark frame
  doc.setFillColor(...FRAME_OUTER);
  doc.rect(0, 0, W, H, "F");

  // Gold border band
  doc.setFillColor(...FRAME_GOLD);
  doc.rect(3, 3, W - 6, H - 6, "F");

  // Inner dark frame
  doc.setFillColor(...FRAME_INNER);
  doc.rect(6, 6, W - 12, H - 12, "F");

  // Gold inner border
  doc.setFillColor(190, 160, 55);
  doc.rect(8, 8, W - 16, H - 16, "F");

  // Green decorative inner border
  doc.setFillColor(...DARK_GREEN);
  doc.rect(10, 10, W - 20, H - 20, "F");

  // Cream interior
  doc.setFillColor(...CREAM_BG);
  doc.rect(13, 13, W - 26, H - 26, "F");

  // Fine gold line inside cream
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.rect(16, 16, W - 32, H - 32);

  // Corner ornaments
  drawCornerOrnament(doc, 16, 16, 1, 1);
  drawCornerOrnament(doc, W - 16, 16, -1, 1);
  drawCornerOrnament(doc, 16, H - 16, 1, -1);
  drawCornerOrnament(doc, W - 16, H - 16, -1, -1);
}

function drawCornerOrnament(doc: jsPDF, cx: number, cy: number, dx: number, dy: number) {
  // Gold flourish elements
  doc.setFillColor(...GOLD);
  doc.setDrawColor(...DARK_GOLD);
  doc.setLineWidth(0.8);

  // Main swirls
  doc.line(cx, cy, cx + dx * 20, cy);
  doc.line(cx, cy, cx, cy + dy * 20);
  doc.line(cx, cy, cx + dx * 15, cy + dy * 15);

  // Decorative curves
  doc.setLineWidth(0.5);
  doc.line(cx + dx * 4, cy, cx + dx * 14, cy + dy * 4);
  doc.line(cx, cy + dy * 4, cx + dx * 4, cy + dy * 14);

  // Gold dot
  doc.setFillColor(...GOLD);
  doc.circle(cx + dx * 7, cy + dy * 7, 1.2, "F");

  // Small leaf shapes
  doc.setFillColor(...DARK_GREEN);
  doc.circle(cx + dx * 4, cy + dy * 4, 0.8, "F");
  doc.circle(cx + dx * 10, cy + dy * 2, 0.6, "F");
  doc.circle(cx + dx * 2, cy + dy * 10, 0.6, "F");
}

// ========== GREEN BANNER ==========
function drawGreenBanner(doc: jsPDF, W: number, y: number, h: number) {
  // Green gradient effect (layered rectangles)
  doc.setFillColor(0, 70, 35);
  doc.roundedRect(W / 2 - 110, y, 220, h, 2, 2, "F");

  doc.setFillColor(...BANNER_GREEN);
  doc.roundedRect(W / 2 - 108, y + 1, 216, h - 2, 2, 2, "F");

  // Gold trim lines
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.line(W / 2 - 106, y + 2, W / 2 + 106, y + 2);
  doc.line(W / 2 - 106, y + h - 2, W / 2 + 106, y + h - 2);
}

// ========== GOLD SEAL WITH WREATH ==========
function drawGoldSeal(doc: jsPDF, x: number, y: number, size: number = 1) {
  const r = 12 * size;

  // Wreath leaves (green) around the seal
  doc.setFillColor(0, 100, 50);
  const leafCount = 16;
  for (let i = 0; i < leafCount; i++) {
    const angle = (Math.PI * 2 * i) / leafCount;
    const lx = x + Math.cos(angle) * (r + 3);
    const ly = y + Math.sin(angle) * (r + 3);
    doc.circle(lx, ly, 1.5 * size, "F");
  }

  // Outer gold ring
  doc.setFillColor(200, 170, 50);
  doc.circle(x, y, r, "F");

  // Dark ring
  doc.setFillColor(140, 110, 30);
  doc.circle(x, y, r - 1.5, "F");

  // Inner gold
  doc.setFillColor(220, 190, 60);
  doc.circle(x, y, r - 2.5, "F");

  // Green center
  doc.setFillColor(0, 90, 45);
  doc.circle(x, y, r - 4, "F");

  // Gold star in center
  doc.setFillColor(240, 210, 80);
  const starPoints = 5;
  for (let i = 0; i < starPoints; i++) {
    const a1 = (Math.PI * 2 * i) / starPoints - Math.PI / 2;
    const a2 = (Math.PI * 2 * (i + 0.5)) / starPoints - Math.PI / 2;
    const sx = x + Math.cos(a1) * (r - 5.5);
    const sy = y + Math.sin(a1) * (r - 5.5);
    const mx = x + Math.cos(a2) * (r - 8);
    const my = y + Math.sin(a2) * (r - 8);
    doc.triangle(x, y, sx, sy, mx, my, "F");
  }

  // Ribbon below seal
  doc.setFillColor(0, 100, 50);
  doc.rect(x - 8 * size, y + r - 1, 7 * size, 8 * size, "F");
  doc.rect(x + 1 * size, y + r - 1, 7 * size, 8 * size, "F");

  // Gold ribbon stripes
  doc.setFillColor(220, 190, 60);
  doc.rect(x - 6 * size, y + r, 1.5 * size, 6 * size, "F");
  doc.rect(x + 4.5 * size, y + r, 1.5 * size, 6 * size, "F");
}

// ========== DECORATIVE DIVIDERS ==========
function drawGoldDivider(doc: jsPDF, W: number, y: number) {
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(W / 2 - 80, y, W / 2 - 5, y);
  doc.line(W / 2 + 5, y, W / 2 + 80, y);
  // Small diamond center
  doc.setFillColor(...GOLD);
  const d = 2;
  doc.triangle(W / 2, y - d, W / 2 + d, y, W / 2, y + d, "F");
  doc.triangle(W / 2, y - d, W / 2 - d, y, W / 2, y + d, "F");
}

// ========== FRONT PAGE ==========
function drawFrontPage(doc: jsPDF, data: CertificateData, qrDataUrl: string | null) {
  const W = 297;
  const H = 210;

  drawOrnateFrame(doc, W, H);

  // ---- Title: "Certificado de Conclusao" ----
  doc.setFontSize(32);
  doc.setFont("helvetica", "bolditalic");
  doc.setTextColor(...DARK_GOLD);
  doc.text("Certificado de Conclusao", W / 2, 38, { align: "center" });

  // ---- Green banner with course info ----
  drawGreenBanner(doc, W, 46, 28);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...WHITE);
  doc.text("Educacao Financeira", W / 2, 56, { align: "center" });

  doc.setFontSize(15);
  doc.setFont("helvetica", "bolditalic");
  doc.setTextColor(240, 220, 100);
  doc.text("Futuro Real Brasil", W / 2, 64, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(220, 220, 200);
  doc.text("Planeje, Invista, Conquiste a Liberdade Financeira!", W / 2, 71, { align: "center" });

  // ---- Gold divider ----
  drawGoldDivider(doc, W, 82);

  // ---- Student name ----
  const fullName = data.userName.toUpperCase();
  doc.setFontSize(24);
  doc.setFont("helvetica", "bolditalic");
  doc.setTextColor(...TEXT_DARK);
  doc.text(fullName, W / 2, 95, { align: "center" });

  // Name underline
  const nameWidth = doc.getTextWidth(fullName);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(W / 2 - nameWidth / 2 - 10, 98, W / 2 + nameWidth / 2 + 10, 98);

  // CPF
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_GRAY);
  doc.text(`CPF: ${formatCPF(data.userCpf)}`, W / 2, 105, { align: "center" });

  // ---- Body text ----
  const studyTimeStr = formatStudyTime(data.studyHoursTotal);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_DARK);

  const bodyText = `Certificamos que o(a) aluno(a) acima concluiu com exito o curso de Educacao Financeira oferecido pelo ${COMPANY}, com a carga horaria de ${studyTimeStr}, em reconhecimento ao seu empenho e dedicacao aos estudos.`;

  const bodyLines = doc.splitTextToSize(bodyText, 200);
  doc.text(bodyLines, W / 2, 115, { align: "center" });

  // ---- Signatures section ----
  const sigY = 150;

  // Left: Aluno signature
  // Name ABOVE the line (cursive-style)
  doc.setFontSize(11);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...TEXT_DARK);
  doc.text(data.userName, W / 2 - 55, sigY - 4, { align: "center" });

  // Signature line
  doc.setDrawColor(...DARK_GREEN);
  doc.setLineWidth(0.3);
  doc.line(W / 2 - 85, sigY, W / 2 - 25, sigY);

  // Label BELOW the line
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEXT_DARK);
  doc.text("Aluno(a)", W / 2 - 55, sigY + 5, { align: "center" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_GRAY);
  doc.text("Aluno(a)", W / 2 - 55, sigY + 9, { align: "center" });

  // Right: Coordenador signature
  doc.setFontSize(11);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...TEXT_DARK);
  doc.text(COMPANY, W / 2 + 55, sigY - 4, { align: "center" });

  doc.line(W / 2 + 25, sigY, W / 2 + 85, sigY);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEXT_DARK);
  doc.text("Coordenador(a)", W / 2 + 55, sigY + 5, { align: "center" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_GRAY);
  doc.text("Coordenador(a)", W / 2 + 55, sigY + 9, { align: "center" });

  // ---- Gold seal on left side ----
  drawGoldSeal(doc, 50, sigY + 5, 0.9);

  // ---- Company logo text at bottom center ----
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK_GREEN);
  doc.text("Futuro Real Brasil", W / 2, H - 32, { align: "center" });

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_GRAY);
  doc.text(`CNPJ: ${CNPJ}`, W / 2, H - 27, { align: "center" });

  // ---- QR Code bottom right ----
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, "PNG", W - 52, H - 48, 28, 28);
  }

  // QR Code caption
  doc.setFontSize(6);
  doc.setTextColor(...TEXT_GRAY);
  doc.text("Para validar este certificado, escaneie o QR Code:", W - 38, H - 50, { align: "center" });
  doc.text(`${PUBLISHED_URL}/verificar-certificado`, W - 38, H - 18, { align: "center" });

  // Verification code
  doc.setFontSize(6.5);
  doc.setTextColor(120, 110, 100);
  doc.text(`Codigo: ${data.verificationCode}`, W - 38, H - 14, { align: "center" });

  // Date at bottom left
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_GRAY);
  doc.text(`Data de conclusao: ${data.completionDate}`, 50, H - 18, { align: "center" });
}

// ========== BACK PAGE ==========
function drawBackPage(doc: jsPDF, data: CertificateData, qrDataUrl: string | null) {
  const W = 297;
  const H = 210;

  drawOrnateFrame(doc, W, H);

  // ---- Title ----
  doc.setFontSize(28);
  doc.setFont("helvetica", "bolditalic");
  doc.setTextColor(...DARK_GOLD);
  doc.text("Verso do Certificado", W / 2, 38, { align: "center" });

  // ---- Green congratulations banner ----
  drawGreenBanner(doc, W, 44, 14);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...WHITE);
  doc.text("Parabens por conquistar mais um passo rumo a", W / 2 - 5, 52, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(240, 220, 100);
  doc.text("Liberdade Financeira!", W / 2 + 75, 52, { align: "left" });

  // ---- Content sections ----
  const sectionX = 30;
  const contentX = 50;
  const sectionW = 180;
  let y = 68;

  // Section 1: Conteudo do Curso
  drawSectionIcon(doc, sectionX, y);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK_GREEN);
  doc.text("Conteudo do Curso", contentX, y + 2);

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_DARK);
  const courseText = "Desenvolva seus conhecimentos em Educacao Financeira, Investimentos Inteligentes e Planejamento Financeiro.";
  const courseLines = doc.splitTextToSize(courseText, sectionW);
  doc.text(courseLines, contentX, y + 8);

  y += 28;

  // Section 2: Beneficios da Educacao Financeira
  drawSectionIcon(doc, sectionX, y);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK_GREEN);
  doc.text("Beneficios da Educacao Financeira", contentX, y + 2);

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_DARK);
  const benefitText = "A Educacao Financeira pode ajudar voce a eliminar dividas, investir com mais seguranca e alcancar a liberdade financeira.";
  const benefitLines = doc.splitTextToSize(benefitText, sectionW);
  doc.text(benefitLines, contentX, y + 8);

  y += 28;

  // Section 3: Continuacao da Jornada
  drawSectionIcon(doc, sectionX, y);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK_GREEN);
  doc.text("Continuacao da Jornada", contentX, y + 2);

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_DARK);
  const journeyText = "Continue sua jornada de aprendizado no Futuro Real Brasil e explore novos caminhos para investir e prosperar.";
  const journeyLines = doc.splitTextToSize(journeyText, sectionW);
  doc.text(journeyLines, contentX, y + 8);

  y += 28;

  // Section 4: Conecte-se Conosco
  drawSectionIcon(doc, sectionX, y);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK_GREEN);
  doc.text("Conecte-se Conosco", contentX, y + 2);

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_DARK);
  const connectText = `Escaneie o QR Code ao lado ou visite ${PUBLISHED_URL} para validar seu certificado e acessar conteudos exclusivos.`;
  const connectLines = doc.splitTextToSize(connectText, sectionW);
  doc.text(connectLines, contentX, y + 8);

  // ---- QR Code on right side ----
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, "PNG", W - 60, 90, 34, 34);
  }

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK_GREEN);
  doc.text(`${PUBLISHED_URL}`, W - 43, 128, { align: "center" });

  // ---- Footer section ----
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(20, H - 35, W - 20, H - 35);

  // Social media
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK_GREEN);
  doc.text("@FuturoReal", 60, H - 27, { align: "center" });

  // Contact info
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_DARK);
  doc.text(`${PUBLISHED_URL}`, W / 2 + 40, H - 27, { align: "center" });

  doc.setFontSize(8);
  doc.text("@FuturoRealBrasil", W / 2 + 40, H - 22, { align: "center" });

  // Company info
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK_GREEN);
  doc.text(`${COMPANY} - CNPJ: ${CNPJ}`, W / 2, H - 16, { align: "center" });

  // Verification code
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 110, 100);
  doc.text(`Codigo de verificacao: ${data.verificationCode}`, W / 2, H - 12, { align: "center" });
}

function drawSectionIcon(doc: jsPDF, x: number, y: number) {
  // Green circle with gold border as icon placeholder
  doc.setFillColor(...GOLD);
  doc.circle(x + 6, y + 4, 7, "F");

  doc.setFillColor(...DARK_GREEN);
  doc.circle(x + 6, y + 4, 5.5, "F");

  // Simple inner symbol (dollar sign area)
  doc.setFillColor(...GOLD);
  doc.circle(x + 6, y + 4, 3, "F");

  doc.setFillColor(...DARK_GREEN);
  doc.circle(x + 6, y + 4, 2, "F");

  doc.setFillColor(...GOLD);
  doc.circle(x + 6, y + 4, 1, "F");
}

// ========== MAIN EXPORT ==========
export async function generateCertificatePDF(data: CertificateData, _siteUrl: string) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const verifyUrl = `${PUBLISHED_URL}/verificar-certificado?code=${data.verificationCode}`;

  // Generate QR Code
  let qrDataUrl: string | null = null;
  try {
    qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 400, margin: 1 });
  } catch (e) {
    console.error("QR generation failed", e);
  }

  // Front page
  drawFrontPage(doc, data, qrDataUrl);

  // Back page
  doc.addPage("a4", "landscape");
  drawBackPage(doc, data, qrDataUrl);

  doc.save(`certificado-${data.verificationCode}.pdf`);
}
