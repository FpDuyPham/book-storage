import ePub from 'epubjs';

export async function parseEpub(file: ArrayBuffer): Promise<{ title: string; author: string; cover: string | null }> {
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

    return {
        title: metadata.title,
        author: metadata.creator,
        cover
    };
}
