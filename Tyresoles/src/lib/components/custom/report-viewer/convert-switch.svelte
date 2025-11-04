<script lang="ts">
  import { onMount } from "svelte";
  import Icon from "../icon/icon.svelte";
  import { DropdownMenu } from "../dropdown-menu";
  import type { Menu } from "../types";

  let { convertType = $bindable("All"), disabled = false } = $props<{
    convertType: "Current" | "All" | "Zip";
    disabled?: boolean;
  }>();

  let menu: Menu = $state({
    label: "Convert PDF To PNG",
    items: [
      {
        label: "All Pages",
        icon: "FileStack",
        checked: convertType === "All",
        onClick: () => {
          convertType = "All";
        },
      },
      {
        label: "Current Page",
        icon: "FileDigit",
        checked: convertType === "Current",
        onClick: () => {
          convertType = "Current";
        },
      },
      {
        label: "Convert & Zip All Pages",
        icon: "FileBox",
        checked: convertType === "Zip",
        onClick: () => {
          convertType = "Zip";
        },
      },
    ],
  });
</script>

<DropdownMenu {menu} {disabled}>
  <Icon
    name={convertType === "All" ? "FileStack" : "FileDigit"}
    class="h-5 w-5"
  />
  <span
    >{convertType === "All"
      ? "All Pages"
      : convertType === "Current"
        ? "Current Page"
        : "Zip All Pages"}</span
  >
</DropdownMenu>
