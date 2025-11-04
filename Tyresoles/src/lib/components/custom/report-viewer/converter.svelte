<script lang="ts">
  import {
    Document,
    Page,
    preferThisWidth,
    type MultipleOf90,
    PageNavigation,
  } from "../pdf-viewer";
  import type { FetchParams } from "$lib/business/models";
  import ConvertSwitch from "./convert-switch.svelte";
  import { Button } from "$lib/components/custom/button";
  import { ProgressBar } from "$lib/components/custom/progress-bar";
  import { loadingStore } from "$lib/managers/stores";
  import { goto } from "$lib";
  import { PdfConverterService } from "../pdf-viewer/converter-service";
  import { Alert } from "../banner";
  import type { BannerProps, MenuItem, InputProps } from "../types";

  let {
    endpoint,
    fetchParam,
    documentName = "tyresoles-doc",
    closePath = "/",
    reportMenuItems = [],
    filterFields = $bindable([]),
    filterData = $bindable({}),
    onSubmitOnly = false,
    isExcel = true,
  } = $props<{
    endpoint?: string;
    fetchParam?: FetchParams;
    documentName?: string;
    closePath?: string;
    reportMenuItems?: Array<MenuItem>;
    filterFields?: Array<InputProps>;
    filterData?: object;
    onSubmitOnly?: boolean;
    isExcel?: boolean;
  }>();

  let data = $state<any>();
  let file = $state<string | URL | undefined>(undefined);
  let convertType = $state<"All" | "Current" | "Zip">("All");
  let pdfDocument = $state<any>();
  let error = $state<string>();

  let scale = $state<number>(1.5);
  let num = $state<number>(1);
  let maxPages = $state<number>(1);
  let renderTextLayer = $state<boolean>(false);
  let rotation = $state<MultipleOf90>(0);
  let sizing = $state<number>(1);
  let target_height = $state<number>(500);
  let fileInput: HTMLInputElement;
  let fileName: string = "";

  $effect(() => {
    if (pdfDocument) {
      maxPages = pdfDocument?._pdfInfo?.numPages;
    }
  });

  const handlePrint = async () => {
    const printService = new PdfConverterService();
    const convertedPages = await printService.convertPDF(pdfDocument, {
      fileName,
    });
    if (convertType === "All") {
      printService.downloadAllPages(convertedPages);
    } else if (convertType === "Current") {
      printService.downloadSinglePage(convertedPages[num - 1]);
    } else {
      printService.downloadAsZip(convertedPages, `${fileName}.zip`);
    }
  };

  const handleFileUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;
    loadingStore.set(true);
    fileName = file.name.replace(/\.[^/.]+$/, ""); //.split(".")[0];
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      data = uint8Array;
    } catch (err) {
      console.log("File upload error:", err);
    } finally {
      loadingStore.set(false);
    }
  };
</script>

<div class="m-1">
  <div
    class="mr-1 flex items-center justify-between gap-1 overflow-y-auto rounded-md bg-slate-200 dark:bg-slate-700"
  >
    <div class="flex">
      <Button
        variant="ghost"
        size="icon"
        icon="X"
        onclick={() => {
          goto(closePath);
        }}
      />
      <Button
        variant="ghost"
        size="icon"
        icon="FolderOpen"
        onclick={() => {
          fileInput.click();
        }}
      />
    </div>
    <div class="flex">
      <PageNavigation bind:maxPages bind:currentPage={num} />
      <Button
        variant="ghost"
        size="icon"
        icon="ZoomIn"
        disabled={$loadingStore}
        onclick={() => {
          scale += 0.5;
        }}
      />
      <Button
        variant="ghost"
        size="icon"
        icon="ZoomOut"
        disabled={$loadingStore}
        onclick={() => {
          if (scale > 0.5) scale -= 0.5;
        }}
      />
    </div>
    <div class="flex">
      <ConvertSwitch bind:convertType />
      <Button
        variant="ghost"
        disabled={$loadingStore || !data}
        size="icon"
        icon="Save"
        onclick={() => {
          handlePrint();
        }}
      />
    </div>
  </div>
  {#if $loadingStore}
    <ProgressBar />
  {/if}
  <div class="relative m-2 h-[85vh] overflow-auto">
    {#if error}
      <Alert
        type="destructive"
        title="Error"
        icon="CircleAlert"
        description={error}
      />
    {:else if data}
      <Document
        {data}
        {file}
        loadsuccess={(document) => {
          console.log("Document loaded:", document);
          pdfDocument = document;
        }}
        loaderror={(error) => {
          error = error;
        }}
      >
        <div class="grid place-items-center">
          <Page
            {scale}
            {num}
            {rotation}
            {renderTextLayer}
            getViewport={sizing === 1
              ? undefined
              : preferThisWidth(target_height)}
          />
        </div>
      </Document>
    {/if}
  </div>
</div>
<input
  type="file"
  onchange={handleFileUpload}
  hidden
  bind:this={fileInput}
  accept=".pdf"
  disabled={$loadingStore}
/>
