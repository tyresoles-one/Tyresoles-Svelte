export class PdfPrintService {
  constructor() { }

  /**
   * Prints the PDF using PDFDocumentProxy by rendering pages to canvas
   * and sending the canvas elements to an iframe for isolated printing.
   * @param pdfDocument - The PDFDocumentProxy instance representing the loaded PDF.
   * @returns A promise that resolves when printing is triggered.
   */
  async printPDF(pdfDocument: any): Promise<void> {
    // Create a hidden iframe for print isolation
    const iframe = this.createPrintIframe();

    // Render PDF pages to canvases and append to the iframe's document body
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const canvas = await this.renderPageToCanvas(page);

      // Append canvas to iframe
      iframe.contentDocument?.body.appendChild(canvas);
    }

    // Inject custom styles to remove margins and control page breaks
    this.addPrintStyles(iframe);

    // Trigger print once all pages are rendered
    this.triggerIframePrint(iframe);
  }

  /**
   * Creates a hidden iframe for print isolation.
   * @returns The created iframe element.
   */
  private createPrintIframe(): HTMLIFrameElement {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe); // Add the iframe to the document
    return iframe;
  }

  /**
   * Injects custom styles into the iframe to ensure proper printing
   * and page layout without unnecessary margins, headers, or footers.
   * @param iframe - The iframe that contains the rendered PDF canvases.
   */
  private addPrintStyles(iframe: HTMLIFrameElement): void {
    const style = iframe.contentDocument?.createElement('style');
    style!.textContent = `
      @media print {
        @page {
          margin: 0; /* Remove default margins */
        }
        body {
          margin: 0; /* Remove body margins */
          padding: 0;
          display: flex; /* Use flexbox for layout */
          flex-direction: column; /* Stack canvases vertically */
        }
        canvas {         
          display: block;
          width: 100%;
          page-break-inside: avoid;
          /*page-break-after: always; *//* Ensure each canvas is treated as a separate page */
        }
      }
    `;
    iframe.contentDocument?.head.appendChild(style!);
  }

  /**
   * Triggers the print dialog for the content in the iframe.
   * @param iframe - The iframe that contains the rendered PDF canvases.
   */
  private triggerIframePrint(iframe: HTMLIFrameElement): void {
    if (iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print(); // Trigger the print dialog
      document.body.removeChild(iframe); // Clean up iframe after printing
    }
  }

  /**
   * Renders a PDF page to a canvas element.
   * @param page - The PDFPageProxy instance representing a single page of the PDF.
   * @returns A promise that resolves to a canvas element with the rendered page.
   */
  private renderPageToCanvas(page: any): Promise<HTMLCanvasElement> {
    return new Promise((resolve) => {
      const viewport = page.getViewport({ scale: 1.5 }); // Adjust scale as needed
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d') as CanvasRenderingContext2D;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderTask = page.render({ canvasContext: context, viewport });
      renderTask.promise.then(() => resolve(canvas));
    });
  }
}
