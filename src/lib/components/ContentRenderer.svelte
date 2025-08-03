<script lang="ts">
    let { filePath, contentKey }: { filePath: string, contentKey: string } = $props();
    
    let ContentComponent: any = $state(null);
    let loading = $state(true);
    let error = $state('');
    let currentKey = $state('');
    
    // Import all .svx files to create a mapping
    const contentFiles = import.meta.glob('/src/routes/storia/content/**/*.svx', { 
        eager: true 
    });
    
    // Watch for changes in contentKey to reload component
    $effect(() => {
        if (contentKey !== currentKey) {
            currentKey = contentKey;
            loadContent();
        }
    });
    
    async function loadContent() {
        loading = true;
        error = '';
        
        try {
            const contentModule = contentFiles[filePath] as any;
            
            if (!contentModule) {
                throw new Error(`Content not found: ${filePath}`);
            }
            
            ContentComponent = contentModule.default;
            loading = false;
        } catch (err) {
            console.error('Failed to load component:', err);
            error = 'Failed to load content';
            loading = false;
        }
    }
</script>

{#if loading}
    <div class="loading">Loading...</div>
{:else if error}
    <div class="error">{error}</div>
{:else if ContentComponent}
    <ContentComponent />
{/if}

<style>
    .loading, .error {
        padding: 1rem;
        text-align: center;
    }
    .error {
        color: red;
    }
</style>