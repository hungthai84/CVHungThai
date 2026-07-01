/**
 * Robustly generates a PDF from an HTML element and triggers a download.
 * Falls back to returning a Blob URL if direct download fails or if requested.
 */
export async function generatePdfFromElement(
    elementId: string, 
    fileName: string = 'resume.pdf',
    onProgress?: (progress: number, status: string) => void
): Promise<{ success: boolean; blobUrl?: string; error?: string }> {
    const element = document.getElementById(elementId);
    if (!element) {
        return { success: false, error: `Element with id ${elementId} not found.` };
    }

    try {
        if (onProgress) onProgress(10, 'Initializing PDF engine...');
        
        // Lazy load libraries to avoid startup errors, with explicit error handling
        const [jsPDFModule, html2canvasModule] = await Promise.all([
            import('jspdf').catch(() => { throw new Error('Failed to load PDF library (jsPDF). Please check your connection.'); }),
            import('html2canvas').catch(() => { throw new Error('Failed to load rendering library (html2canvas). Please check your connection.'); })
        ]);
        
        const jsPDF = jsPDFModule.jsPDF;
        const html2canvas = html2canvasModule.default;

        if (onProgress) onProgress(25, 'Analyzing document structure...');

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
                if (onProgress) onProgress(25 + Math.floor((i / pages.length) * 55), `Rendering page ${i + 1} of ${pages.length}...`);
                
                const pageElement = pages[i] as HTMLElement;
                try {
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
                } catch (pageError) {
                    throw new Error(`Failed to render page ${i + 1}. The content might contain unsupported elements.`);
                }
            }
        } else {
            if (onProgress) onProgress(40, 'Rendering document...');
            // Fallback to single image if structure is different
            try {
                const canvas = await html2canvas(element, {
                    scale: 2.0,
                    useCORS: true,
                    logging: false,
                    allowTaint: true,
                    backgroundColor: '#ffffff'
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.8);
                const pageHeight = pdf.internal.pageSize.getHeight();
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pageHeight, undefined, 'FAST');
            } catch (canvasError) {
                throw new Error('Failed to render the document. The content might contain unsupported elements or external images blocking the render.');
            }
        }

        if (onProgress) onProgress(85, 'Assembling PDF file...');

        // Generate Blob URL
        let blobUrl: string;
        try {
            const blob = pdf.output('blob');
            blobUrl = URL.createObjectURL(blob);
        } catch (pdfError) {
            throw new Error('Failed to assemble the final PDF file.');
        }

        if (onProgress) onProgress(95, 'Preparing download...');

        // Attempt direct download
        try {
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (downloadError) {
            console.warn('Direct download failed, falling back to Blob URL', downloadError);
            // We don't throw here, as the user can still use the fallback modal
        }

        if (onProgress) onProgress(100, 'Complete!');
        return { success: true, blobUrl };
    } catch (error) {
        console.error('PDF generation error:', error);
        
        // Enhance error message for the user
        let errorMessage = 'An unknown error occurred while generating the PDF.';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        
        return { success: false, error: errorMessage };
    }
}
