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
    // Convert filename to readable title
    // e.g., "chapter-1" -> "Chapter 1", "historical-context" -> "Historical Context"
    return filename
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function generateChaptersFromContent(): Chapter[] {
    // Get all files in the content directory
    const allFiles = import.meta.glob('./content/**/*.{md,svx}', { eager: true });
    const pageFiles = import.meta.glob('./content/**/+page.svx', { eager: true });
    
    // Build directory structure
    const directories = new Map<string, {
        path: string;
        hasPageFile: boolean;
        files: string[];
        subdirs: Set<string>;
    }>();
    
    // Analyze all files to build directory structure
    for (const filePath of Object.keys(allFiles)) {
        const relativePath = filePath.replace('./content/', '');
        const pathParts = relativePath.split('/');
        
        // Build directory hierarchy
        for (let i = 0; i < pathParts.length - 1; i++) {
            const dirPath = pathParts.slice(0, i + 1).join('/');
            const fullDirPath = `./content/${dirPath}`;
            
            if (!directories.has(dirPath)) {
                directories.set(dirPath, {
                    path: dirPath,
                    hasPageFile: false,
                    files: [],
                    subdirs: new Set()
                });
            }
            
            const dirInfo = directories.get(dirPath)!;
            
            // Check if this directory has a +page.svx file
            const pageFilePath = `${fullDirPath}/+page.svx`;
            if (Object.keys(pageFiles).includes(pageFilePath)) {
                dirInfo.hasPageFile = true;
            }
            
            // Add file to directory
            if (i === pathParts.length - 2) {
                dirInfo.files.push(pathParts[pathParts.length - 1]);
            }
            
            // Add subdirectory reference
            if (i > 0) {
                const parentDir = pathParts.slice(0, i).join('/');
                directories.get(parentDir)?.subdirs.add(pathParts[i]);
            }
        }
    }
    
    return buildChapterHierarchy(directories, allFiles);
}

function buildChapterHierarchy(
    directories: Map<string, any>, 
    allFiles: Record<string, any>,
    currentPath: string = '',
    baseUrl: string = '/storia'
): Chapter[] {
    const chapters: Chapter[] = [];
    
    // Get items in current directory
    const currentItems = new Set<string>();
    
    // Add direct files
    for (const filePath of Object.keys(allFiles)) {
        const relativePath = filePath.replace('./content/', '');
        if (currentPath === '') {
            // Root level
            const pathParts = relativePath.split('/');
            if (pathParts.length === 1) {
                currentItems.add(pathParts[0]);
            } else if (pathParts.length > 1) {
                currentItems.add(pathParts[0]);
            }
        } else {
            // Subdirectory level
            if (relativePath.startsWith(currentPath + '/')) {
                const remainingPath = relativePath.substring(currentPath.length + 1);
                const nextPart = remainingPath.split('/')[0];
                currentItems.add(nextPart);
            }
        }
    }
    
    for (const item of Array.from(currentItems).sort()) {
        const itemPath = currentPath ? `${currentPath}/${item}` : item;
        const fullItemPath = `./content/${itemPath}`;
        
        // Check if this is a directory (has subdirectories or is in our directories map)
        const isDirectory = directories.has(itemPath) || 
                           Object.keys(allFiles).some(f => 
                               f.startsWith(`${fullItemPath}/`) && 
                               f !== `${fullItemPath}` &&
                               !f.endsWith(`/${item}`)
                           );
        
        if (isDirectory) {
            // Handle directories as chapters/subchapters
            const subchapters = buildChapterHierarchy(directories, allFiles, itemPath, `${baseUrl}/${item}`);
            const hasContent = Object.keys(allFiles).includes(`${fullItemPath}/+page.svx`);
            
            chapters.push({
                id: idCounter++,
                title: formatTitle(item),
                url: `${baseUrl}/${item}`,
                hasContent,
                subchapters
            });
        } else if (item.endsWith('.md') || item.endsWith('.svx')) {
            // Handle markdown or svelte files as chapters
            const fileName = item.replace(/\.(md|svx)$/, '');
            
            chapters.push({
                id: idCounter++,
                title: formatTitle(fileName),
                url: `${baseUrl}/${fileName}`,
                hasContent: true,
                subchapters: []
            });
        }
    }
    
    return chapters.sort((a, b) => a.title.localeCompare(b.title));
}

export const load: LayoutServerLoad = async () => {
    const chapters = generateChaptersFromContent();

    return {
        chapters
    };
};