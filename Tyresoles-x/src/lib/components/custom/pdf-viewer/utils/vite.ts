import { onDestroy, setContext } from 'svelte';

export const set_pdfjs_context = () => {
    if (typeof window === 'undefined' ) return;
    if (typeof window !== 'undefined' && window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${window.pdfjsLib?.version}/pdf.worker.min.mjs`;
        // Use the global pdfjsLib to create the worker
        const worker = new window.pdfjsLib.PDFWorker();
        // Set the worker in the Svelte context so child components can access it
        setContext('svelte_pdfjs_worker', worker);
        // Destroy the worker when the component is destroyed
        onDestroy(() => worker.destroy());
        console.log(worker);
    } else {
        console.error("pdfjsLib is not loaded on the window object. Make sure the CDN is included.");
    }
};
