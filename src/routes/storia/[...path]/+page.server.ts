import { error } from '@sveltejs/kit';
import { compile } from 'mdsvex';
import type { PageServerLoad } from './$types';

// Import all .svx files using Vite's glob import
const contentFiles = import.meta.glob('/src/routes/storia/content/**/*.svx', { 
    as: 'raw',
    eager: true 
});

export const load: PageServerLoad = async ({ params }) => {
    const contentPath = params.path || '';
    
    try {
        const fileName = contentPath.split('/').pop() || '';
        const directoryPath = contentPath.split('/').slice(0, -1).join('/');
        
        // Construct the file path that matches the glob pattern
        let filePath: string;
        if (directoryPath) {
            filePath = `/src/routes/storia/content/${directoryPath}/${fileName}.svx`;
        } else {
            filePath = `/src/routes/storia/content/${fileName}.svx`;
        }
        
        // Get the content from the pre-imported files
        const rawContent = contentFiles[filePath];
        
        if (!rawContent) {
            throw new Error(`Content not found: ${filePath}`);
        }
        
        // Process with mdsvex
        const processed = await compile(rawContent, {
            filename: filePath
        });
        
        return {
            content: processed?.code || rawContent,
            path: contentPath,
            fileName: `${fileName}.svx`
        };
    } catch (err) {
        console.error('Error loading content:', err);
        throw error(404, 'Content not found');
    }
};