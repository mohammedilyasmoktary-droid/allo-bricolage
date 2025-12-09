import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface BookingPDFData {
  bookingId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  technicianName: string;
  technicianPhone: string;
  serviceCategory: string;
  description: string;
  address: string;
  city: string;
  scheduledDate?: string;
  status: string;
  estimatedPrice?: number;
  finalPrice?: number;
  paymentMethod?: string;
  paymentStatus: string;
  receiptUrl?: string;
  transactionId?: string;
  createdAt: string;
  review?: {
    rating: number;
    comment?: string;
    createdAt: string;
  };
}

export interface QuotePDFData {
  quoteId: string;
  bookingId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  technicianName: string;
  technicianPhone: string;
  serviceCategory: string;
  description: string;
  address: string;
  city: string;
  conditions: string;
  equipment: string;
  price: number;
  createdAt: string;
}

export const generateBookingPDF = async (data: BookingPDFData): Promise<void> => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (yPos + requiredHeight > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
  };

  // Title
  doc.setFontSize(20);
  doc.setTextColor(3, 43, 90); // #032B5A
  doc.setFont('helvetica', 'bold');
  doc.text('Facture de Service', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Company Info
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Allo Bricolage', pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.text('Plateforme de Services de Maintenance', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Divider
  doc.setDrawColor(244, 197, 66); // #F4C542
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Booking Details Section
  doc.setFontSize(14);
  doc.setTextColor(3, 43, 90);
  doc.setFont('helvetica', 'bold');
  doc.text('Détails de la Réservation', margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  // Booking ID
  doc.setFont('helvetica', 'bold');
  doc.text('ID de Réservation:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.bookingId, margin + 50, yPos);
  yPos += 7;

  // Date
  doc.setFont('helvetica', 'bold');
  doc.text('Date de Création:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  const createdDate = new Date(data.createdAt).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(createdDate, margin + 50, yPos);
  yPos += 7;

  // Status
  doc.setFont('helvetica', 'bold');
  doc.text('Statut:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  const statusText = {
    PENDING: 'En attente',
    ACCEPTED: 'Accepté',
    ON_THE_WAY: 'En route',
    IN_PROGRESS: 'En cours',
    COMPLETED: 'Terminé',
    AWAITING_PAYMENT: 'En attente de paiement',
    CANCELLED: 'Annulé',
  }[data.status] || data.status;
  doc.text(statusText, margin + 50, yPos);
  yPos += 10;

  // Client Information
  doc.setFontSize(14);
  doc.setTextColor(3, 43, 90);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations Client', margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFont('helvetica', 'bold');
  doc.text('Nom:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.clientName, margin + 20, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('Email:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.clientEmail, margin + 20, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('Téléphone:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.clientPhone, margin + 20, yPos);
  yPos += 10;

  // Technician Information
  doc.setFontSize(14);
  doc.setTextColor(3, 43, 90);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations Technicien', margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFont('helvetica', 'bold');
  doc.text('Nom:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.technicianName, margin + 20, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('Téléphone:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.technicianPhone, margin + 20, yPos);
  yPos += 10;

  // Service Information
  doc.setFontSize(14);
  doc.setTextColor(3, 43, 90);
  doc.setFont('helvetica', 'bold');
  doc.text('Détails du Service', margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFont('helvetica', 'bold');
  doc.text('Catégorie:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.serviceCategory, margin + 30, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('Description:', margin, yPos);
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  const descriptionLines = doc.splitTextToSize(data.description, pageWidth - 2 * margin);
  doc.text(descriptionLines, margin, yPos);
  yPos += descriptionLines.length * 5 + 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Adresse:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.address}, ${data.city}`, margin + 25, yPos);
  yPos += 7;

  if (data.scheduledDate) {
    doc.setFont('helvetica', 'bold');
    doc.text('Date prévue:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    const scheduledDate = new Date(data.scheduledDate).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    doc.text(scheduledDate, margin + 35, yPos);
    yPos += 10;
  } else {
    yPos += 5;
  }

  // Payment Information
  checkPageBreak(40);
  doc.setFontSize(14);
  doc.setTextColor(3, 43, 90);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations de Paiement', margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  if (data.estimatedPrice) {
    doc.setFont('helvetica', 'bold');
    doc.text('Prix estimé:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${data.estimatedPrice.toFixed(2)} MAD`, margin + 40, yPos);
    yPos += 7;
  }

  if (data.finalPrice) {
    doc.setFont('helvetica', 'bold');
    doc.text('Prix final:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(244, 197, 66);
    doc.setFontSize(12);
    doc.text(`${data.finalPrice.toFixed(2)} MAD`, margin + 40, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    yPos += 7;
  }

  if (data.paymentMethod) {
    doc.setFont('helvetica', 'bold');
    doc.text('Méthode de paiement:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    const paymentMethodText = {
      CASH: 'Espèces',
      CARD: 'Carte bancaire',
      WAFACASH: 'Wafacash',
      BANK_TRANSFER: 'Virement bancaire',
    }[data.paymentMethod] || data.paymentMethod;
    doc.text(paymentMethodText, margin + 50, yPos);
    yPos += 7;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Statut du paiement:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  const paymentStatusText = {
    UNPAID: 'Non payé',
    PENDING: 'En attente',
    PAID: 'Payé',
  }[data.paymentStatus] || data.paymentStatus;
  doc.text(paymentStatusText, margin + 50, yPos);
  yPos += 7;

  if (data.transactionId) {
    doc.setFont('helvetica', 'bold');
    doc.text('ID de transaction:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.transactionId, margin + 50, yPos);
    yPos += 7;
  }

  // Receipt Image Section
  if (data.receiptUrl) {
    checkPageBreak(80);
    doc.setFontSize(12);
    doc.setTextColor(3, 43, 90);
    doc.setFont('helvetica', 'bold');
    doc.text('Reçu de Paiement', margin, yPos);
    yPos += 8;
    
      // Try to load and embed the receipt image
      if (!data.receiptUrl.endsWith('.pdf')) {
        try {
          // Load image and convert to base64 for PDF embedding
          const loadImageAsBase64 = (url: string): Promise<string> => {
            return new Promise((resolve, reject) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                try {
                  const canvas = document.createElement('canvas');
                  canvas.width = img.width;
                  canvas.height = img.height;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    const base64 = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(base64);
                  } else {
                    reject(new Error('Could not get canvas context'));
                  }
                } catch (err) {
                  reject(err);
                }
              };
              img.onerror = () => reject(new Error('Failed to load image'));
              img.src = url;
            });
          };

          try {
            const base64Image = await loadImageAsBase64(data.receiptUrl);
            const maxWidth = pageWidth - 2 * margin;
            const maxHeight = 70; // Max height for receipt in PDF
            
            // Get image dimensions from base64
            const img = new Image();
            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = () => reject(new Error('Failed to load image for dimensions'));
              img.src = base64Image;
            });
            
            let imgWidth = img.width;
            let imgHeight = img.height;
            
            // Scale to fit
            if (imgWidth > maxWidth) {
              const ratio = maxWidth / imgWidth;
              imgWidth = maxWidth;
              imgHeight = imgHeight * ratio;
            }
            if (imgHeight > maxHeight) {
              const ratio = maxHeight / imgHeight;
              imgHeight = maxHeight;
              imgWidth = imgWidth * ratio;
            }
            
            // Add image to PDF
            doc.addImage(
              base64Image,
              'JPEG',
              margin,
              yPos,
              imgWidth,
              imgHeight
            );
            yPos += imgHeight + 10;
          } catch (imgError) {
            // If image loading fails, just show the URL
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.setFont('helvetica', 'normal');
            doc.text('Reçu disponible à:', margin, yPos);
            yPos += 5;
            const urlLines = doc.splitTextToSize(data.receiptUrl, pageWidth - 2 * margin);
            doc.text(urlLines, margin, yPos);
            yPos += urlLines.length * 5 + 5;
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
          }
        } catch (error) {
          // Fallback: just show text
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.setFont('helvetica', 'normal');
          doc.text('Reçu disponible (voir URL ci-dessous)', margin, yPos);
          yPos += 5;
          const urlLines = doc.splitTextToSize(data.receiptUrl, pageWidth - 2 * margin);
          doc.text(urlLines, margin, yPos);
          yPos += urlLines.length * 5 + 5;
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
        }
    } else {
      // PDF receipt - just show link text
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text('Reçu PDF disponible à:', margin, yPos);
      yPos += 5;
      const urlLines = doc.splitTextToSize(data.receiptUrl, pageWidth - 2 * margin);
      doc.text(urlLines, margin, yPos);
      yPos += urlLines.length * 5 + 5;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
    }
  } else {
    yPos += 5;
  }

  // Review Section
  if (data.review) {
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setTextColor(3, 43, 90);
    doc.setFont('helvetica', 'bold');
    doc.text('Avis Client', margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFont('helvetica', 'bold');
    doc.text('Note:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${data.review.rating}/5`, margin + 25, yPos);
    yPos += 7;

    if (data.review.comment) {
      doc.setFont('helvetica', 'bold');
      doc.text('Commentaire:', margin, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      const commentLines = doc.splitTextToSize(data.review.comment, pageWidth - 2 * margin);
      doc.text(commentLines, margin, yPos);
      yPos += commentLines.length * 5 + 5;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Date de l\'avis:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    const reviewDate = new Date(data.review.createdAt).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.text(reviewDate, margin + 40, yPos);
    yPos += 10;
  }

  // Footer
  const footerY = pageHeight - 20;
  doc.setDrawColor(244, 197, 66);
  doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Merci d\'avoir utilisé Allo Bricolage!', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, footerY + 5, { align: 'center' });

  // Save PDF
  doc.save(`facture-${data.bookingId.substring(0, 8)}.pdf`);
};

