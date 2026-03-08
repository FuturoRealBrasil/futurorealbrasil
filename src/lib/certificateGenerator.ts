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

export async function generateCertificatePDF(data: CertificateData, _siteUrl: string) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;

  const verifyUrl = `${PUBLISHED_URL}/verificar-certificado?code=${data.verificationCode}`;

  // Load assets in parallel
  const [frontDataUrl, backDataUrl, qrDataUrl] = await Promise.all([
    loadImageAsDataUrl(certFrenteImg),
    loadImageAsDataUrl(certVersoImg),
    QRCode.toDataURL(verifyUrl, { width: 400, margin: 1 }).catch(() => null),
  ]);

  // Background color matching the certificate parchment
  const bgColor = { r: 228, g: 218, b: 190 };

  // ===== FRONT PAGE =====
  doc.addImage(frontDataUrl, "PNG", 0, 0, W, H);

  // --- Clear placeholder areas before writing dynamic text ---

  // Clear student name area
  doc.setFillColor(bgColor.r, bgColor.g, bgColor.b);
  doc.rect(55, 98, 187, 12, "F");

  // Clear CPF area
  doc.rect(110, 111, 77, 6, "F");

  // Clear body text area
  doc.rect(45, 118, 207, 22, "F");

  // Clear left signature name area
  doc.rect(65, 146, 80, 8, "F");

  // Clear right signature name area
  doc.rect(160, 146, 80, 8, "F");

  // Clear date area
  doc.rect(20, H - 22, 70, 8, "F");

  // Clear verification code area
  doc.rect(W - 65, H - 18, 55, 8, "F");

  // --- Write dynamic text ---

  // Student name
  const fullName = data.userName.toUpperCase();
  doc.setFontSize(18);
  doc.setFont("helvetica", "bolditalic");
  doc.setTextColor(40, 30, 20);
  doc.text(fullName, W / 2, 105, { align: "center" });

  // CPF
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 90, 75);
  doc.text(`CPF: ${formatCPF(data.userCpf)}`, W / 2, 115, { align: "center" });

  // Body text
  const studyTimeStr = formatStudyTime(data.studyHoursTotal);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 30, 20);
  const bodyText = `Certificamos que o(a) aluno(a) acima concluiu com exito o curso de Educacao Financeira oferecido pelo ${COMPANY}, com a carga horaria de ${studyTimeStr}, em reconhecimento ao seu empenho e dedicacao aos estudos.`;
  const bodyLines = doc.splitTextToSize(bodyText, 185);
  doc.text(bodyLines, W / 2, 124, { align: "center" });

  // Left signature (Instrutor)
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(40, 30, 20);
  doc.text("Monteiro", 105, 150, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Instrutor", 105, 154, { align: "center" });

  // Right signature (Coordenador)
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(COMPANY, 200, 150, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Coordenador(a)", 200, 154, { align: "center" });

  // Date
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 90, 75);
  doc.text(`Data: ${data.completionDate}`, 55, H - 17, { align: "center" });

  // Verification code
  doc.setFontSize(6);
  doc.setTextColor(100, 90, 75);
  doc.text(`Codigo: ${data.verificationCode}`, W - 38, H - 14, { align: "center" });

  // QR Code
  if (qrDataUrl) {
    doc.setFillColor(255, 255, 255);
    doc.rect(W - 56, H - 50, 32, 32, "F");
    doc.addImage(qrDataUrl, "PNG", W - 55, H - 49, 30, 30);
  }

  // ===== BACK PAGE =====
  doc.addPage("a4", "landscape");
  doc.addImage(backDataUrl, "PNG", 0, 0, W, H);

  // Clear QR area on back page
  if (qrDataUrl) {
    doc.setFillColor(255, 255, 255);
    doc.rect(W - 68, 78, 40, 40, "F");
    doc.addImage(qrDataUrl, "PNG", W - 66, 80, 36, 36);
  }

  // Clear and rewrite verification URL
  doc.setFillColor(bgColor.r, bgColor.g, bgColor.b);
  doc.rect(W - 78, 119, 60, 6, "F");
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 80, 40);
  doc.text(`${PUBLISHED_URL}/verificar-certificado`, W - 48, 123, { align: "center" });

  // Clear and rewrite verification code at bottom
  doc.rect(W / 2 - 40, H - 18, 80, 8, "F");
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 110, 100);
  doc.text(`Codigo: ${data.verificationCode}`, W / 2, H - 13, { align: "center" });

  doc.save(`certificado-${data.verificationCode}.pdf`);
}
