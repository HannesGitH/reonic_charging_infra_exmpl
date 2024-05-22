<script lang="ts">
    import GHCard from "$lib/components/GHCard.svelte";

</script>
<div>
    <GHCard {content}/>
</div>

{#snippet content()}
    <i class="fa fa-solid fa-bolt"></i>
{/snippet}

<style>
    .fa-bolt {
        color: rgb(243, 243, 190);
        transform: translateZ(2px);
    }
</style>