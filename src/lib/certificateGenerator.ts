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

  // ===== FRONT PAGE =====
  // Full background image
  doc.addImage(frontDataUrl, "PNG", 0, 0, W, H);

  // Student name - positioned over the "Nome do(a) Aluno(a)" area
  const fullName = data.userName.toUpperCase();
  doc.setFontSize(20);
  doc.setFont("helvetica", "bolditalic");
  doc.setTextColor(40, 30, 20);
  doc.text(fullName, W / 2, 108, { align: "center" });

  // CPF below name
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 90, 75);
  doc.text(`CPF: ${formatCPF(data.userCpf)}`, W / 2, 114, { align: "center" });

  // Body text over the certification paragraph area
  const studyTimeStr = formatStudyTime(data.studyHoursTotal);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 30, 20);
  const bodyText = `Certificamos que o(a) aluno(a) acima concluiu com exito o curso de Educacao Financeira oferecido pelo ${COMPANY}, com a carga horaria de ${studyTimeStr}, em reconhecimento ao seu empenho e dedicacao aos estudos.`;
  const bodyLines = doc.splitTextToSize(bodyText, 190);
  doc.text(bodyLines, W / 2, 122, { align: "center" });

  // Left signature name (Aluno)
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(40, 30, 20);
  doc.text(data.userName, 105, 152, { align: "center" });

  // Right signature name (Coordenador)
  doc.text(COMPANY, 200, 152, { align: "center" });

  // Date
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 90, 75);
  doc.text(`Data: ${data.completionDate}`, 55, H - 18, { align: "center" });

  // Verification code near QR area
  doc.setFontSize(6);
  doc.setTextColor(100, 90, 75);
  doc.text(`Codigo: ${data.verificationCode}`, W - 38, H - 14, { align: "center" });

  // QR Code overlay on bottom right (over the template QR placeholder)
  if (qrDataUrl) {
    // White background to cover template QR
    doc.setFillColor(255, 255, 255);
    doc.rect(W - 56, H - 50, 32, 32, "F");
    doc.addImage(qrDataUrl, "PNG", W - 55, H - 49, 30, 30);
  }

  // ===== BACK PAGE =====
  doc.addPage("a4", "landscape");
  doc.addImage(backDataUrl, "PNG", 0, 0, W, H);

  // QR Code overlay on back page (right side area)
  if (qrDataUrl) {
    doc.setFillColor(255, 255, 255);
    doc.rect(W - 68, 78, 40, 40, "F");
    doc.addImage(qrDataUrl, "PNG", W - 66, 80, 36, 36);
  }

  // Verification URL under QR
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 80, 40);
  doc.text(`${PUBLISHED_URL}/verificar-certificado`, W - 48, 122, { align: "center" });

  // Verification code at bottom
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 110, 100);
  doc.text(`Codigo: ${data.verificationCode}`, W / 2, H - 14, { align: "center" });

  doc.save(`certificado-${data.verificationCode}.pdf`);
}
