<script lang="ts">
  import "../app.css";
  import MainWindow from "$lib/components/custom/main-window/main-window.svelte";
  import favicon from "$lib/assets/favicon.ico";

  let { children } = $props();
</script>

<MainWindow>
  {@render children?.()}
</MainWindow>
