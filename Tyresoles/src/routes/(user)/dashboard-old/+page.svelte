<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Popover from '$lib/components/ui/popover';
	import { Icon, Input, Button, ProgressBar, toast, DialogPage, Grid } from '$lib/components';
	import { fetchParamsStore, loadingStore, dashboardDataStore } from '$lib/managers/stores';
	import { endpoints, apiFetch } from '$lib/managers/network';
	import type {
		FetchParams,
		DashboardData,
		Sales,
		CustomerSales,
		CollectionData
	} from '$lib/business/models';
	import { filterRespCenters, SalesRespCenters } from '$lib/business';

	let activeTab = $state<string>('filter');
	const views = ['Product Sale', 'Active Customers', 'Salesperson', 'Dealer', 'Collection'];
	let dbrdData = $state<DashboardData>();
	let activeView = $state<string>(views[0]);
	let fetchParams = $state<FetchParams>({
		...$fetchParamsStore,
		reportName: views[0],
		respCenters:
			$fetchParamsStore?.respCenters && $fetchParamsStore.respCenters.length > 1
				? [$fetchParamsStore?.respCenters[0]]
				: []
	} as FetchParams);
	let open = $state<boolean>(false);
	let records = $state<Array<object>>([]);
	const filterLabel = $derived.by(() => {
		let txt = '';
		if (fetchParams.from) {
			txt += `For Period (${fetchParams.from}..${fetchParams.to}),`;
		}
		if (fetchParams.respCenters && fetchParams.respCenters.length > 0) {
			txt += ` Locations: (${fetchParams.respCenters.map((rc) => rc).join(', ')})`;
		}
		return txt;
	});

	const onSubmit = () => {
		if (!fetchParams.from || !fetchParams.to) {
			toast.error('Please select From and To date');
			return;
		}
		if (!fetchParams.respCenters || fetchParams.respCenters.length === 0) {
			toast.error('Please select at least one Location');
			return;
		}
		apiFetch(endpoints.sales.salesDashboard, {
			method: 'POST',
			body: { ...fetchParams, reportName: activeView } as FetchParams
		}).then((res) => {
			if (res.success) {
				dbrdData = res.data as DashboardData;
				activeTab = 'view';
			}
		});
	};
	$inspect(dbrdData, 'dbrdData');
</script>

<div>
	{#if $loadingStore}
		<ProgressBar />
	{/if}
	<Accordion.Root
		type="single"
		class="w-full px-2"
		onValueChange={(value: string) => (activeTab = value)}
		bind:value={activeTab}
	>
		<Accordion.Item value="filter">
			<Accordion.Trigger class="py-2 text-[15px] leading-6 hover:no-underline">
				<span class="flex items-center gap-3">
					<Icon name="Filter" class="h-4 w-4 opacity-60" />
					<span class="opacity-60">Filter</span>
					{#if filterLabel}
						<span class="text-gray-700 sm:font-thin md:font-medium lg:font-medium"
							>{filterLabel}</span
						>
					{/if}
				</span>
			</Accordion.Trigger>
			<Accordion.Content>
				<div class="flex flex-col gap-2 p-2 lg:md:flex-row lg:md:gap-3">
					<Input
						label="Location"
						bind:value={fetchParams.respCenters}
						type="list"
						disabled={$loadingStore}
						columns={[{ name: 'name', label: 'Response Center' }]}
						hideHeader={true}
						dataKey="code"
						labelKey="name"
						valueKey="code"
						selectionType="multiple"
						output="array"
						data={filterRespCenters($fetchParamsStore?.respCenters || [], 'sales')}
					/>
					<Input
						label="From"
						type="date"
						bind:value={fetchParams.from}
						preset="thisMonth,lastMonth,thisQuarter,lastQuarter,thisYear,lastYear,custom"
						disabled={$loadingStore}
						onInput={(value: unknown, extra: unknown) => {
							if (fetchParams) {
								fetchParams.from = value as string;
								fetchParams.to = extra !== undefined ? (extra as string) : '';
							}
						}}
					/>
					<Input label="To" type="date" bind:value={fetchParams.to} disabled={$loadingStore} />
					<Button
						label="Submit"
						icon="Send"
						class="mt-6"
						disabled={$loadingStore}
						onclick={onSubmit}
					/>
				</div>
			</Accordion.Content>
		</Accordion.Item>
		<Accordion.Item value="view">
			<Accordion.Trigger class="py-2 text-[15px] leading-6 hover:no-underline">
				<span class="flex items-center gap-3">
					<Icon name="FileChartLine" class="h-4 w-4 opacity-60" />
					<span class="opacity-60">View</span>
				</span>
			</Accordion.Trigger>
			<Accordion.Content>
				<div class="w-full">
					<Tabs.Root
						class="w-full"
						disabled={$loadingStore}
						bind:value={activeView}
						onValueChange={(tab) => {
							onSubmit();
						}}
					>
						<Tabs.List>
							{#each views as view}
								<Tabs.Trigger value={view}>{view}</Tabs.Trigger>
							{/each}
						</Tabs.List>
						<Tabs.Content value="Product Sale" class="mt-2">
							{@render productSale(dbrdData)}
						</Tabs.Content>
						<Tabs.Content value="Active Customers" class="mt-2">
							{@render activeCustomer(dbrdData)}
						</Tabs.Content>
						<Tabs.Content value="Salesperson" class="mt-2">
							{#if dbrdData && dbrdData.name === 'SalesmanSale'}
								<Tabs.Root
									value={dbrdData.data && dbrdData.data.length > 0 ? dbrdData.data[0].product : ''}
									class="w-full"
								>
									<Tabs.List>
										{#each dbrdData.data as salesmanData}
											<Tabs.Trigger value={salesmanData.product}
												>{salesmanData.product}</Tabs.Trigger
											>
										{/each}
									</Tabs.List>
									{#each dbrdData.data as salesmanData}
										<Tabs.Content value={salesmanData.product} class="mt-2">
											{#if salesmanData.data.length === 0}
												<div class="text-center italic text-gray-600">No data found</div>
											{:else}
												<Grid data={salesmanData.data} />
											{/if}
										</Tabs.Content>
									{/each}
								</Tabs.Root>
							{/if}
						</Tabs.Content>
						<Tabs.Content value="Dealer" class="mt-2">
							{#if dbrdData && dbrdData.name === 'DealerSale'}
								<Tabs.Root
									value={dbrdData.data && dbrdData.data.length > 0 ? dbrdData.data[0].product : ''}
									class="w-full"
								>
									<Tabs.List>
										{#each dbrdData.data as salesmanData}
											<Tabs.Trigger value={salesmanData.product}
												>{salesmanData.product}</Tabs.Trigger
											>
										{/each}
									</Tabs.List>
									{#each dbrdData.data as salesmanData}
										<Tabs.Content value={salesmanData.product} class="mt-2">
											{#if salesmanData.data.length === 0}
												<div class="text-center italic text-gray-600">No data found</div>
											{:else}
												<Grid data={salesmanData.data} />
											{/if}
										</Tabs.Content>
									{/each}
								</Tabs.Root>
							{/if}
						</Tabs.Content>
						<Tabs.Content value="Collection" class="mt-2">
							{@render collections(dbrdData)}
						</Tabs.Content>
					</Tabs.Root>
				</div>
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>
</div>

{#snippet productSale(source: DashboardData | undefined)}
	{#if source && source?.name === 'ProductSale'}
		<div>
			{#each source.data as prodSale}
				<div class="mb-4 w-full rounded border border-gray-300 bg-gray-100 p-2">
					<div
						class="rounded border border-gray-400 bg-gray-200 p-1 text-center font-bold uppercase tracking-wide text-gray-700"
					>
						{prodSale.product}
					</div>
					<div class="w-full">
						<div class="mt-2 flex gap-2 overflow-x-auto">
							{#each prodSale.data as sale}
								{@render saleCard(sale, prodSale.product === 'Grand Total')}
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
{/snippet}

{#snippet saleCard(source: Sales | undefined, header: boolean = false)}
	{#if source}
		<div class="w-full rounded bg-white p-1 shadow-xl">
			{#if header}
				<div class="text-center font-semibold capitalize text-gray-700">{source.label}</div>
				<div class="text-center text-gray-700">{source.dateRange}</div>
			{/if}
			<div class="mx-2 my-1 rounded bg-slate-100 text-center font-bold text-blue-600">
				{#if source.saleText === '-'}
					<span class="text-lg">{source.saleText}</span>
				{:else}
					<span class="text-lg">{`${source.saleText.split('.')[0]}.`}</span>
					<span class="-ml-1">{source.saleText.split('.')[1]}</span>
					<span class="mr-6">{source.saleUnit}</span>
				{/if}
			</div>
			<div>
				{#if source.items && source.items.length > 0}
					{#each source.items as item}
						<div
							class="bp-1 mx-2 flex justify-between rounded border-b border-gray-200 px-2 text-sm text-gray-600 last:border-0 last:bg-slate-100 last:pb-1 last:pr-8 last:font-bold"
						>
							<div class="mr-4 flex w-full justify-between">
								<span>{item.label}</span>
								<span class="text-left text-gray-700"
									>{`${item.value === 0 ? '-' : item.value}`}</span
								>
							</div>
							<span>{item.unit}</span>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
{/snippet}

{#snippet activeCustomer(source: DashboardData | undefined)}
	{#if source && source?.name === 'ActiveCustomer'}
		<div>
			{#each source.data as prodSale}
				<div class="mb-4 w-full rounded border border-gray-300 bg-gray-100 p-2">
					<div
						class="rounded border border-gray-400 bg-gray-200 p-1 text-center font-bold uppercase tracking-wide text-gray-700"
					>
						{prodSale.product}
					</div>
					<div class="w-full">
						<div class="mt-2 flex gap-2 overflow-x-auto">
							{#each prodSale.data as sale}
								{@render customerSaleCard(sale)}
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
{/snippet}
{#snippet customerSaleCard(source: CustomerSales | undefined)}
	{#if source}
		<div class="flex w-full flex-col justify-center gap-1 rounded bg-white p-1 shadow-xl">
			<div class="text-center text-gray-700">{source.dateRange}</div>

			<Popover.Root>
				<Popover.Trigger
					class="top-0 text-lg font-bold text-blue-700"
					onclick={() => {
						records = source.records;
					}}>{source.records.length}</Popover.Trigger
				>
				<Popover.Content class="max-h-[80vh] w-[90vw] overflow-auto p-4 md:w-[70vw] lg:w-[60vw]">
					<Grid
						data={records}
						footer
						columns={[
							{ name: 'code', label: 'Code' },
							{ name: 'name', label: 'Name' },
							{
								name: 'sale',
								label: 'Sale',
								textAlign: 'right',
								formatter: (v) => {
									return v === 0 || undefined ? '' : Number.parseFloat(v).toLocaleString('en-US');
								},
								aggregation: 'sum'
							}
						]}
					/>
				</Popover.Content>
			</Popover.Root>
			{#each source.lines as line}
				<div
					class="bp-1 mx-2 flex justify-between rounded border-b border-gray-200 px-2 text-sm text-gray-600"
				>
					<div class="mr-4 flex w-full justify-between">
						<span>{line.description}</span>
						<span class="text-left text-gray-700">{line.amount}</span>
					</div>
					<span>{line.unit}</span>
				</div>
			{/each}
		</div>
	{/if}
{/snippet}

{#snippet collections(source: DashboardData | undefined)}
	{#if source && source?.name === 'Collection'}
		<div class="mt-2 flex gap-2 overflow-x-auto p-4">
			{#each source.data as collection}
				<div class="flex w-full flex-col justify-center gap-1 rounded bg-white p-1 py-4 shadow-xl">
					<div class="text-center text-lg text-slate-700">Collection</div>
					<div class="text-center text-gray-700">{collection.period}</div>

					<Popover.Root>
						<Popover.Trigger
							class="top-0 text-lg font-bold text-blue-700"
							onclick={() => {
								records = collection.data;
							}}>{collection.collection}</Popover.Trigger
						>
						<Popover.Content
							class="max-h-[80vh] w-[90vw] overflow-auto p-4 md:w-[70vw] lg:w-[60vw]"
						>
							<Grid data={records} footer />
						</Popover.Content>
					</Popover.Root>
				</div>
			{/each}
		</div>
	{/if}
{/snippet}
