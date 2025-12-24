import ePub from 'epubjs';

export async function parseEpub(file: ArrayBuffer): Promise<{ title: string; author: string; cover: string | null; totalChapters: number }> {
    const book = ePub(file);
    await book.ready;
    const metadata = await book.loaded.metadata;
    const coverUrl = await book.coverUrl();

    let cover: string | null = null;
    if (coverUrl) {
        try {
            const response = await fetch(coverUrl);
            const blob = await response.blob();
            cover = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.error("Failed to load cover", e);
        }
    }

    // Extract chapter count
    let totalChapters = 0;
    if (book.navigation && book.navigation.toc) {
        // Flatten TOC to count actual chapters
        const countItems = (items: any[]) => {
            let count = 0;
            items.forEach(item => {
                count++;
                if (item.subitems && item.subitems.length > 0) {
                    count += countItems(item.subitems);
                }
            });
            return count;
        };
        totalChapters = countItems(book.navigation.toc);
    }

    // Fallback: Use spine length if TOC is empty (approximate)
    if (totalChapters === 0 && book.spine) {
        totalChapters = (book.spine as any).length || 0;
    }

    return {
        title: metadata.title,
        author: metadata.creator,
        cover,
        totalChapters
    };
}
