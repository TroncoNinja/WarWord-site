import type { LayoutServerLoad } from './$types';

interface Chapter {
    id: number;
    title: string;
    url: string;
    hasContent: boolean;
    subchapters: Chapter[];
}

let idCounter = 1;

function formatTitle(filename: string): string {
    // Remove .svx extension and preserve original casing
    return filename.replace('.svx', '');
}

// Import all .svx files using Vite's glob import
const contentFiles = import.meta.glob('/src/routes/storia/content/**/*.svx', { 
    eager: true 
});

function generateChaptersFromContent(): Chapter[] {
    const chapters: Chapter[] = [];
    const pathMap = new Map<string, Chapter>();
    
    // Get all file paths and organize them
    const filePaths = Object.keys(contentFiles);
    
    filePaths.forEach(fullPath => {
        // Extract relative path: /src/routes/storia/content/economia/Nuovo Dollaro.svx -> economia/Nuovo Dollaro.svx
        const relativePath = fullPath.replace('/src/routes/storia/content/', '');
        const pathParts = relativePath.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const directories = pathParts.slice(0, -1);
        
        // Build directory structure
        let currentPath = '';
        let currentLevel = chapters;
        
        directories.forEach((dir, index) => {
            currentPath = currentPath ? `${currentPath}/${dir}` : dir;
            
            let existingChapter = currentLevel.find(ch => ch.url === `/storia/${currentPath}`);
            
            if (!existingChapter) {
                existingChapter = {
                    id: idCounter++,
                    title: formatTitle(dir),
                    url: `/storia/${currentPath}`,
                    hasContent: false,
                    subchapters: []
                };
                currentLevel.push(existingChapter);
            }
            
            currentLevel = existingChapter.subchapters;
        });
        
        // Add the file as a chapter
        const fileUrl = `/storia/${relativePath.replace('.svx', '')}`;
        currentLevel.push({
            id: idCounter++,
            title: formatTitle(fileName),
            url: fileUrl,
            hasContent: true,
            subchapters: []
        });
    });
    
    return chapters;
}

export const load: LayoutServerLoad = async () => {
    try {
        const chapters = generateChaptersFromContent();
        
        return {
            chapters
        };
    } catch (error) {
        console.error('Error loading chapters:', error);
        return {
            chapters: []
        };
    }
};