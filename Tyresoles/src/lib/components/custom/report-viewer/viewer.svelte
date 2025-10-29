<script lang="ts">
	import {
		Document,
		Page,
		preferThisWidth,
		type MultipleOf90,
		PageNavigation
	} from '../pdf-viewer';
	import type { FetchParams } from '$lib/business/models';
	import { apiFetch } from '$lib/managers/network';
	import { onMount } from '$lib';
	import { Button } from '$lib/components/custom/button';
	import { ProgressBar } from '$lib/components/custom/progress-bar';
	import { Filter } from '$lib/components/custom/fech-param-filter';
	import { loadingStore } from '$lib/managers/stores';
	import OutputSwitch from './output-switch.svelte';
	import ReportSwitch from './report-switch.svelte';
	import { goto } from '$lib';
	import { PdfPrintService } from '../pdf-viewer/printer-service';
	import { Alert } from '../banner';
	import type { BannerProps, MenuItem, InputProps } from '../types';
	import { on } from 'svelte/events';

	let {
		endpoint,
		fetchParam,
		documentName = 'tyresoles-doc',
		closePath = '/',
		reportMenuItems = [],
		filterFields = $bindable([]),
		filterData = $bindable({}),
		onSubmitOnly = false,
		isExcel = true
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

	let filterOpen = $state<boolean>(false);
	let originalData = $state<any>();
	let data = $state<any>();
	let file = $state<string | URL | undefined>(undefined);
	let reportOutput = $state<'PDF' | 'Excel'>('PDF');
	let pdfDocument = $state<any>();
	let error = $state<string>();
	let alert = $state<BannerProps>();

	let scale = $state<number>(1.5);
	let num = $state<number>(1);
	let maxPages = $state<number>(1);
	let renderTextLayer = $state<boolean>(false);
	let rotation = $state<MultipleOf90>(0);
	let sizing = $state<number>(1);
	let target_height = $state<number>(500);

	$effect(() => {
		if (pdfDocument) {
			maxPages = pdfDocument?._pdfInfo?.numPages;
		}
	});
	const fetchReport = () => {
		if (fetchParam && fetchParam.reportName && endpoint) {
			apiFetch(endpoint, {
				method: 'POST',
				body: { ...fetchParam, reportOutput }
			}).then((res) => {
				if (res.success) {
					num = 1;
					originalData = res.data;
					if (reportOutput === 'PDF') {
						data = atob(originalData);
					} else {
						alert = {
							type: 'default',
							title: 'Excel Report',
							icon: 'FileText',
							description:
								'Report in Excel format is not directly supported, Please download the report to view.',
							buttons: [
								{
									label: 'Download',
									icon: 'Download',
									onclick: () => {
										handleSave();
									}
								}
							]
						};
					}
				}
			});
		}
	};

	$effect(() => {
		if (!filterOpen) {
			fetchParam;
			endpoint;
			fetchReport();
		}
	});

	onMount(() => {
		fetchReport();
	});

	const handleSave = () => {
		if (originalData || file) {
			const link = document.createElement('a');
			if (reportOutput === 'PDF') {
				link.href = file ? String(file) : `data:application/pdf;base64,${originalData}`;
			} else {
				const contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;';
				const bytes = atob(originalData);
				let length = bytes.length;
				let out = new Uint8Array(length);
				while (length--) {
					out[length] = bytes.charCodeAt(length);
				}
				const blob = new Blob([out], { type: contentType });
				link.href = URL.createObjectURL(blob);
			}
			link.download = `${documentName}.${reportOutput === 'PDF' ? 'pdf' : 'xlsx'}`;
			link.click();
		}
	};
	const handlePrint = () => {
		if (reportOutput === 'PDF') {
			const printService = new PdfPrintService();
			printService.printPDF(pdfDocument);
		} else {
			alert = {
				type: 'default',
				title: 'Excel Print',
				icon: 'FileText',
				description:
					'Printing of Excel is not directly supported, Please download the report to print.',
				buttons: [
					{
						label: 'Download',
						icon: 'Download',
						onclick: () => {
							handleSave();
						}
					}
				]
			};
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

			{#if filterFields && filterFields.length > 0}
				<Filter
					disabled={$loadingStore}
					bind:fields={filterFields}
					bind:data={filterData}
					onOpenChange={(o) => (filterOpen = o)}
					onSubmit={fetchReport}
				/>
			{/if}

			<ReportSwitch disabled={$loadingStore} menuItems={reportMenuItems} />
			<OutputSwitch bind:reportOutput disabled={$loadingStore} {isExcel} />
		</div>
		{#if reportOutput === 'PDF'}
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
		{/if}
		<div class="flex">
			<Button
				variant="ghost"
				disabled={$loadingStore}
				size="icon"
				icon="RefreshCcw"
				onclick={() => {
					fetchReport();
				}}
			/>
			<Button
				variant="ghost"
				disabled={$loadingStore}
				size="icon"
				icon="Save"
				onclick={() => {
					handleSave();
				}}
			/>
			<Button
				variant="ghost"
				disabled={$loadingStore}
				size="icon"
				icon="Printer"
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
			<Alert type="destructive" title="Error" icon="CircleAlert" description={error} />
		{:else if reportOutput === 'PDF' && originalData}
			<Document
				{data}
				{file}
				loadsuccess={(document) => {
					console.log('Document loaded:', document);
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
						getViewport={sizing === 1 ? undefined : preferThisWidth(target_height)}
					/>
				</div>
			</Document>
		{:else if reportOutput === 'Excel' && originalData && alert}
			<Alert {...alert} />
		{/if}
	</div>
</div>
