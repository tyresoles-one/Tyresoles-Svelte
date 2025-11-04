export interface ConvertedPage {
  pageNumber: number;
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  filename: string;
}

export class PdfConverterService {
  constructor() {}

  /**
   * Converts the PDF to PNG images by rendering pages to canvas
   * and converting each canvas to a PNG Blob.
   * @param pdfDocument - The PDFDocumentProxy instance representing the loaded PDF.
   * @param options - Optional conversion settings.
   * @returns A promise that resolves to an array of converted pages.
   */
  async convertPDF(
    pdfDocument: any,
    options?: { scale?: number; quality?: number; fileName?: string }
  ): Promise<ConvertedPage[]> {
    const { scale = 2, quality = 0.95, fileName = "" } = options || {};
    const convertedPages: ConvertedPage[] = [];

    // Render each PDF page to PNG
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const canvas = await this.renderPageToCanvas(page, scale);
      const { blob, dataUrl } = await this.canvasToPng(canvas, quality);

      convertedPages.push({
        pageNumber: pageNum,
        blob,
        dataUrl,
        width: canvas.width,
        height: canvas.height,
        filename: `${fileName}-page-${pageNum}.png`,
      });
    }

    return convertedPages;
  }

  /**
   * Downloads a single converted page as PNG.
   * @param page - The converted page object containing blob and filename.
   */
  downloadSinglePage(page: ConvertedPage): void {
    const link = document.createElement("a");
    link.href = page.dataUrl;
    link.download = page.filename;
    link.click();
  }

  /**
   * Downloads all converted pages as individual PNG files.
   * @param pages - Array of converted pages.
   */
  async downloadAllPages(pages: ConvertedPage[]): Promise<void> {
    for (const page of pages) {
      this.downloadSinglePage(page);
      // Small delay to prevent browser blocking multiple downloads
      await this.delay(200);
    }
  }

  /**
   * Downloads all converted pages as a single ZIP file.
   * Requires jszip library: npm install jszip
   * @param pages - Array of converted pages.
   * @param zipFilename - Name of the ZIP file (default: 'converted-pdf.zip').
   */
  async downloadAsZip(
    pages: ConvertedPage[],
    zipFilename: string = "converted-pdf.zip"
  ): Promise<void> {
    // Dynamic import to avoid bundling if not used
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    // Add each page to the ZIP
    for (const page of pages) {
      zip.file(page.filename, page.blob);
    }

    // Generate ZIP and trigger download
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = zipFilename;
    link.click();

    // Cleanup
    URL.revokeObjectURL(url);
  }

  /**
   * Renders a PDF page to a canvas element.
   * @param page - The PDFPageProxy instance representing a single page of the PDF.
   * @param scale - The scale factor for rendering quality (default: 2).
   * @returns A promise that resolves to a canvas element with the rendered page.
   */
  private renderPageToCanvas(
    page: any,
    scale: number
  ): Promise<HTMLCanvasElement> {
    return new Promise((resolve) => {
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d") as CanvasRenderingContext2D;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderTask = page.render({ canvasContext: context, viewport });
      renderTask.promise.then(() => resolve(canvas));
    });
  }

  /**
   * Converts a canvas to PNG format using toBlob for better performance.
   * @param canvas - The canvas element to convert.
   * @param quality - Image quality (0-1) for lossy formats (not applicable to PNG).
   * @returns A promise that resolves to an object containing the Blob and data URL.
   */
  private canvasToPng(
    canvas: HTMLCanvasElement,
    quality: number
  ): Promise<{ blob: Blob; dataUrl: string }> {
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            throw new Error("Failed to convert canvas to blob");
          }

          // Create data URL for immediate preview/download
          const dataUrl = URL.createObjectURL(blob);

          resolve({ blob, dataUrl });
        },
        "image/png",
        quality
      );
    });
  }

  /**
   * Utility function to create a delay.
   * @param ms - Milliseconds to delay.
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
