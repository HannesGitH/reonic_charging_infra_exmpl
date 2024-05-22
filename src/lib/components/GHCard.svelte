<script lang="ts">
    import { hover3dFactory } from '$lib/utils/hooks/hover3d';
	import type { Snippet } from 'svelte';
    let { content }  : { content: Snippet } = $props();
  </script>
  
  <style>
   .glowing-card {
      border-radius: 1rem;
      border: 1px solid var(--main-color);
      padding: 1rem;
      margin: 1rem;
      box-shadow: 0 0 1.2rem -0.5rem var(--main-color);
    }
  </style>
  
  <div class="glowing-card" use:hover3dFactory()>
    {@render content()}
  </div>