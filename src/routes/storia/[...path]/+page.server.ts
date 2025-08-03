import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Import all .svx files using Vite's glob import
const contentFiles = import.meta.glob('/src/routes/storia/content/**/*.svx', { 
    eager: true 
});

export const load: PageServerLoad = async ({ params }) => {
    const contentPath = params.path || '';
    
    try {
        const fileName = contentPath.split('/').pop() || '';
        const directoryPath = contentPath.split('/').slice(0, -1).join('/');
        
        let filePath: string;
        if (directoryPath) {
            filePath = `/src/routes/storia/content/${directoryPath}/${fileName}.svx`;
        } else {
            filePath = `/src/routes/storia/content/${fileName}.svx`;
        }
        
        // Check if file exists in our glob imports
        const contentModule = contentFiles[filePath] as any;
        
        if (!contentModule) {
            console.log('Available files:', Object.keys(contentFiles));
            console.log('Looking for:', filePath);
            throw error(404, `Content not found: ${filePath}`);
        }
        
        return {
            filePath,
            path: contentPath,
            fileName: `${fileName}.svx`,
            // Pass a unique key to force component re-render
            contentKey: contentPath
        };
    } catch (err) {
        console.error('Error loading content:', err);
        throw error(404, 'Content not found');
    }
};