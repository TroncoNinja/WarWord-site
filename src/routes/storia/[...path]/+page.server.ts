import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

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
        
        return {
            componentPath: filePath,
            path: contentPath,
            fileName: `${fileName}.svx`
        };
    } catch (err) {
        console.error('Error loading content:', err);
        throw error(404, 'Content not found');
    }
};