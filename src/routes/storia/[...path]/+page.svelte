<script lang="ts">
    import type { PageData } from './$types';
    
    let { data }: { data: PageData } = $props();
    
    // Dynamically import the component
    let ContentComponent: any = $state(null);
    
    $effect(() => {
        (async () => {
            try {
                const module = await import(/* @vite-ignore */ data.componentPath);
                ContentComponent = module.default;
            } catch (error) {
                console.error('Failed to load component:', error);
            }
        })();
    });
</script>

<div class="prose prose-invert max-w-none">
    {#if ContentComponent}
        <ContentComponent />
    {/if}
</div>