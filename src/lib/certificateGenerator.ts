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
  // Student name placeholder area
  [0.185, 0.44, 0.63, 0.08],
  // "Certificamos que..." body text area
  [0.12, 0.53, 0.76, 0.12],
  // Left signature name area
  [0.18, 0.70, 0.25, 0.06],
  // Right signature name area
  [0.52, 0.70, 0.25, 0.06],
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

      for (const [xPct, yPct, wPct, hPct] of clearRegions) {
        const x = Math.floor(xPct * canvas.width);
        const y = Math.floor(yPct * canvas.height);
        const w = Math.floor(wPct * canvas.width);
        const h = Math.floor(hPct * canvas.height);

        // Sample background color from left edge of region
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

export async function generateCertificatePDF(data: CertificateData, _siteUrl: string) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;

  const verifyUrl = `${PUBLISHED_URL}/verificar-certificado?code=${data.verificationCode}`;

  // Load front with cleared regions, back as-is (new template), and QR code
  const [frontDataUrl, backDataUrl, qrDataUrl] = await Promise.all([
    loadAndCleanImage(certFrenteImg, FRONT_CLEAR_REGIONS),
    loadImageAsDataUrl(certVersoImg),
    QRCode.toDataURL(verifyUrl, { width: 400, margin: 1 }).catch(() => null),
  ]);

  // ===== FRONT PAGE =====
  doc.addImage(frontDataUrl, "PNG", 0, 0, W, H);

  // Student name - centered
  const fullName = data.userName.toUpperCase();
  doc.setFontSize(18);
  doc.setFont("helvetica", "bolditalic");
  doc.setTextColor(40, 30, 20);
  doc.text(fullName, W / 2, 100, { align: "center" });

  // CPF below name
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 70, 55);
  doc.text(`CPF: ${formatCPF(data.userCpf)}`, W / 2, 106, { align: "center" });

  // Body text - certification paragraph
  const studyTimeStr = formatStudyTime(data.studyHoursTotal);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 30, 20);
  const bodyText = `Certificamos que o(a) aluno(a) acima concluiu com exito o curso de Educacao Financeira oferecido pelo ${COMPANY}, com carga horaria de ${studyTimeStr}, em reconhecimento ao seu empenho e dedicacao aos estudos.`;
  const bodyLines = doc.splitTextToSize(bodyText, 190);
  doc.text(bodyLines, W / 2, 116, { align: "center" });

  // Left signature - Student name ABOVE the line
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(40, 30, 20);
  doc.text(data.userName, 95, 150, { align: "center" });

  // Right signature - Company name ABOVE the line
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(40, 30, 20);
  doc.text(COMPANY, 200, 150, { align: "center" });

  // Date - bottom left
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 70, 55);
  doc.text(`Data: ${data.completionDate}`, 55, H - 16, { align: "center" });

  // Verification code - bottom right
  doc.setFontSize(6);
  doc.setTextColor(80, 70, 55);
  doc.text(`Codigo: ${data.verificationCode}`, W - 40, H - 12, { align: "center" });

  // QR Code - bottom right corner (for verification)
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, "PNG", W - 54, H - 47, 28, 28);
  }

  // ===== BACK PAGE =====
  // Use the new template image as-is (no QR code, no dynamic content overlay)
  doc.addPage("a4", "landscape");
  doc.addImage(backDataUrl, "PNG", 0, 0, W, H);

  // Only add verification code at bottom
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 90, 75);
  doc.text(`Codigo de Verificacao: ${data.verificationCode}`, W / 2, H - 12, { align: "center" });

  doc.save(`certificado-${data.verificationCode}.pdf`);
}
