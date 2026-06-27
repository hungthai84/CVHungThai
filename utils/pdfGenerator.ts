/**
 * Robustly generates a PDF from an HTML element and triggers a download.
 * Falls back to returning a Blob URL if direct download fails or if requested.
 */
export async function generatePdfFromElement(elementId: string, fileName: string = 'resume.pdf'): Promise<{ success: boolean; blobUrl?: string; error?: string }> {
    const element = document.getElementById(elementId);
    if (!element) {
        return { success: false, error: `Element with id ${elementId} not found.` };
    }

    try {
        // Lazy load libraries to avoid startup errors
        const [jsPDFModule, html2canvasModule] = await Promise.all([
            import('jspdf'),
            import('html2canvas')
        ]);
        
        const jsPDF = jsPDFModule.jsPDF;
        const html2canvas = html2canvasModule.default;

        // Use html2canvas to capture the element
        const canvas = await html2canvas(element, {
            scale: 2.0,
            useCORS: true,
            logging: false,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Calculate dimensions to fit PDF page
        // Standard A4 is 210mm x 297mm
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();

        // If content is longer than one page, we might need to handle paging
        // but for a resume, usually it's structured in pages within the element.
        // The current PrintableView has multiple .print-page divs.
        
        const pages = element.querySelectorAll('.print-page');
        if (pages.length > 0) {
            // Multipage handling
            for (let i = 0; i < pages.length; i++) {
                const pageElement = pages[i] as HTMLElement;
                const pageCanvas = await html2canvas(pageElement, {
                    scale: 2.0,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });
                const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.8);
                
                const pageHeight = pdf.internal.pageSize.getHeight();
                
                if (i > 0) {
                    pdf.addPage();
                }
                
                pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, pageHeight, undefined, 'FAST');
            }
        } else {
            // Fallback to single image if structure is different
            const pageHeight = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pageHeight, undefined, 'FAST');
        }

        // Generate Blob URL
        const blob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(blob);

        // Attempt direct download
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return { success: true, blobUrl };
    } catch (error) {
        console.error('PDF generation error:', error);
        return { success: false, error: (error as Error).message };
    }
}
