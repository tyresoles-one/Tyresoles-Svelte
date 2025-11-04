<script lang="ts">
  import { PageWindow, Button, Icon } from "$lib/components";
  import { goto } from "$lib";
</script>

<PageWindow>
  <div>
    <div
      class="px-2 flex gap-4 shadow-2xl border-b-2 border-gray-200 py-3 items-center"
    >
      <Icon name="Settings2" /><span class="font-bold">Tools</span>
    </div>
    <div class="flex gap-3 mt-4 flex-wrap">
      <Button
        icon="FileInput"
        iconClass="ml-1/4"
        label="PDF to Image Converter"
        onclick={() => goto("/utility/pdf-converter")}
      />
    </div>
  </div>
</PageWindow>
