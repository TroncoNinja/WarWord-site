<script lang="ts">
    import type { PageData } from './$types';
    import ContentRenderer from '$lib/components/ContentRenderer.svelte';
    
    let { data }: { data: PageData } = $props();
</script>

<div class="prose prose-invert max-w-none">
    <ContentRenderer filePath={data.filePath} contentKey={data.contentKey} />
</div>