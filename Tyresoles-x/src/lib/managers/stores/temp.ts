import { writable } from 'svelte/store';
import type { DialogProps } from '$lib/components/custom/types';
import type { OrderInfo, OrderLine, CodeName, FetchParams } from '$lib/business/models';

export const orderStore = writable<OrderInfo | null>(null);
export const postedOrderStore = writable<OrderInfo | null>(null);
export const orderLinesStore = writable<Array<OrderLine> | null>(null);
export const statesStore = writable<Array<CodeName> | null>(null);
export const marketsStore = writable<Array<CodeName> | null>(null);

export const loadingStore = writable<boolean>(false);
export const dialogStore = writable<DialogProps>({
	open: false,
	actionLabel: 'Ok',
	cancelLabel: 'Cancel',
	icon: 'ShieldQuestion',
	description: undefined,
	onAction: undefined,
	onCancel: undefined,
	title: undefined
});
export const tempFetchParamsStore = writable<FetchParams>();
