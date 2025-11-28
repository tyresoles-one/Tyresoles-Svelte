<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import type { DialogPageProps } from "../types";
  import { Icon } from "$lib/components/custom/icon";
  import { Button } from "$lib/components/custom/button";
  import Progressbar from "../progress-bar/progressbar.svelte";
  import { cn } from "$lib/utils";

  let {
    open,
    title,
    icon,
    description,
    actionLabel,
    loading,
    footer = true,
    overlay = true,
    autoFocus = true,
    actions,
    onOpenChange,
    onAction,
    onClose,
    children,
    onEscapeKeydown,
    onInteractOutside,
    onFocusOutside,
    interactOutsideBehavior,
    escapeKeydownBehavior,
    class: className,
  }: DialogPageProps = $props();
</script>

<Dialog.Root {open} {onOpenChange}>
  {#if overlay}
    <Dialog.Overlay />
  {/if}
  <Dialog.Content
    class={cn(className, "p-2")}
    {interactOutsideBehavior}
    {escapeKeydownBehavior}
    {onEscapeKeydown}
    {onInteractOutside}
    {onFocusOutside}
    onOpenAutoFocus={(e) => {
      if (!autoFocus) {
        e.preventDefault();
      }
    }}
  >
    <Dialog.Header>
      <div class="flex flex-col items-center gap-1">
        <div class="flex gap-2">
          {#if icon}
            <Icon name={icon} class="h-5 w-5" />
          {/if}
          {#if title}
            <Dialog.Title>{title}</Dialog.Title>
          {/if}
        </div>

        {#if loading}
          <Progressbar />
        {/if}
      </div>

      {#if description}
        <Dialog.Description>{description}</Dialog.Description>
      {/if}
    </Dialog.Header>
    {@render children?.()}
    {#if footer}
      <Dialog.Footer>
        {#if actions}
          {#each actions as action}
            <Button {...action} />
          {/each}
        {/if}
        {#if actionLabel && onAction}
          <Button {loading} onclick={onAction}>{actionLabel}</Button>
        {/if}
      </Dialog.Footer>
    {/if}
  </Dialog.Content>
</Dialog.Root>
