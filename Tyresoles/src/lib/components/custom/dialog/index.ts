import Dialog from './dialog.svelte';
export { Dialog };
import type { DialogProps } from '../types';

import { dialogStore } from '$lib/managers/stores';

export const dialogShow = (props: DialogProps) => {
	console.log(props.cancelLabel);
	dialogStore.update((state) => ({
		cancelLabel: props.cancelLabel ?? state.cancelLabel,
		actionLabel: props.actionLabel ?? state.actionLabel,
		icon: props.icon ?? state.icon,
		title: props.title,
		description: props.description,
		onAction: props.onAction,
		onCancel: props.onCancel,
		open: true
	}));
};
export const dialogHide = () => {
	dialogStore.update((state) => ({ ...state, open: false }));
};
