import type { NavItemProps } from '$lib/components/custom/types';

export function convertMenuToNavItems(
	menuItems: {
		action: string;
		group?: string | null;
		home?: boolean;
		icon?: string;
		iconType?: string;
		order?: number;
		title: string;
	}[]
): NavItemProps[] {
	const navItemsMap = new Map<string, NavItemProps>();

	for (const item of menuItems) {
		if (!item.group || item.group === item.title) {
			navItemsMap.set(item.title, {
				title: item.title,
				url: item.action,
				icon: item.icon as string,
				items: []
			});
		}
	}
	if (menuItems.length > 0 && navItemsMap.entries.length !== menuItems.length) {
		menuItems.forEach((item) => {
			if (item.group && item.group !== item.title) {
				const parent = navItemsMap.get(item.group);
				if (parent) {
					parent.items!.push({ title: item.title, url: item.action, icon: item.icon as string });
				}
			}
		});
	}

	// Convert the map to an array of NavItemProps
	return Array.from(navItemsMap.values());
}
