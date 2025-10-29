<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Icon from '../icon/icon.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import type { DropdownMenuProps } from '../types';
	import { cn } from '$lib/utils';

	let {
		menu,
		disabled,
		buttonVariant = 'ghost',
		buttonSize,
		class: className,
		triggerClass,
		children
	}: DropdownMenuProps = $props();
</script>

{#if menu && menu?.items?.length}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			{disabled}
			class={cn(buttonVariants({ variant: buttonVariant, size: buttonSize }), triggerClass)}
		>
			{@render children?.()}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class={className}>
			{#if menu.label}
				<DropdownMenu.Label>{menu.label}</DropdownMenu.Label>
				<DropdownMenu.Separator />
			{/if}
			<DropdownMenu.Group>
				{#each menu.items as item}
					{#if item.items && item.items.length}
						<DropdownMenu.Sub>
							<DropdownMenu.SubTrigger>
								{#if item.icon}
									<Icon name={item.icon} class="mr-2 h-4 w-4" />
								{/if}
								{#if item.label}
									<span>{item.label}</span>
								{/if}
							</DropdownMenu.SubTrigger>
							<DropdownMenu.SubContent>
								{#each item.items as subItem}
									<DropdownMenu.Item disabled={subItem.disabled} onclick={subItem.onClick}>
										{#if subItem.icon}
											<Icon name={subItem.icon} class="mr-2 h-4 w-4" />
										{/if}
										{#if subItem.label}
											<span>{subItem.label}</span>
										{/if}
										{#if subItem.shortcut}
											<DropdownMenu.Shortcut>{subItem.shortcut}</DropdownMenu.Shortcut>
										{/if}
									</DropdownMenu.Item>
								{/each}
							</DropdownMenu.SubContent>
						</DropdownMenu.Sub>
					{:else if item.seperator}
						<DropdownMenu.Separator />
					{:else if item.checkBox}
						<DropdownMenu.CheckboxItem
							bind:checked={item.checked}
							onCheckedChange={item.onCheckedChange}
						>
							{#if item.icon}
								<Icon name={item.icon} class="mr-2 h-4 w-4" />
							{/if}
							{#if item.label}
								<span>{item.label}</span>
							{/if}
							{#if item.shortcut}
								<DropdownMenu.Shortcut>{item.shortcut}</DropdownMenu.Shortcut>
							{/if}
						</DropdownMenu.CheckboxItem>
					{:else if item?.radioOptions?.length}
						<DropdownMenu.RadioGroup bind:value={item.radioValue}>
							{#each item.radioOptions as option}
								<DropdownMenu.RadioItem value={option.value}>{option.label}</DropdownMenu.RadioItem>
							{/each}
						</DropdownMenu.RadioGroup>
					{:else}
						<DropdownMenu.Item disabled={item.disabled} onclick={item.onClick}>
							{#if item.icon}
								<Icon name={item.icon} class="mr-2 h-4 w-4" />
							{/if}
							{#if item.label}
								<span>{item.label}</span>
							{/if}
							{#if item.shortcut}
								<DropdownMenu.Shortcut>{item.shortcut}</DropdownMenu.Shortcut>
							{/if}
						</DropdownMenu.Item>
					{/if}
				{/each}
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
