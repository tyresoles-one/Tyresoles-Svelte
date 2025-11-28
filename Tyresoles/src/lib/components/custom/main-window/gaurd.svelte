<script lang="ts">
  import { goto } from "$lib";
  import { userStore } from "$lib/managers/stores";
  $effect(() => {
    if (!$userStore) {
      goto("/login");
    }
  });
</script>

<div></div>
