
export const storageService = {
    async getDirectory() {
        return await navigator.storage.getDirectory();
    },

    async saveBookData(id: string, data: ArrayBuffer): Promise<void> {
        try {
            const root = await this.getDirectory();
            const fileHandle = await root.getFileHandle(`${id}.epub`, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(data);
            await writable.close();
        } catch (error) {
            console.error('Error saving book data to OPFS:', error);
            throw error;
        }
    },

    async getBookData(id: string): Promise<ArrayBuffer> {
        try {
            const root = await this.getDirectory();
            const fileHandle = await root.getFileHandle(`${id}.epub`);
            const file = await fileHandle.getFile();
            return await file.arrayBuffer();
        } catch (error) {
            console.error('Error getting book data from OPFS:', error);
            throw error;
        }
    },

    async deleteBookData(id: string): Promise<void> {
        try {
            const root = await this.getDirectory();
            await root.removeEntry(`${id}.epub`);
        } catch (error) {
            // Ignore error if file doesn't exist
            if ((error as DOMException).name !== 'NotFoundError') {
                console.error('Error deleting book data from OPFS:', error);
                throw error;
            }
        }
    },

    async estimateUsage(): Promise<{ usage: number, quota: number }> {
        if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate();
            return {
                usage: estimate.usage || 0,
                quota: estimate.quota || 0
            };
        }
        return { usage: 0, quota: 0 };
    }
};
