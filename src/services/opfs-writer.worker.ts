/// <reference lib="webworker" />

self.onmessage = async (e: MessageEvent) => {
    const { id, arrayBuffer } = e.data;

    try {
        // Access OPFS directory directly from Worker
        const root = await navigator.storage.getDirectory();
        const fileHandle = await root.getFileHandle(`${id}.epub`, { create: true });

        // Create a synchronous access handle (Only available in Workers)
        const accessHandle = await fileHandle.createSyncAccessHandle();

        // Clear the file content
        accessHandle.truncate(0);

        // Write the new content
        const buffer = new Uint8Array(arrayBuffer);
        accessHandle.write(buffer, { at: 0 });

        // Flush changes to disk
        accessHandle.flush();

        // Close the handle
        accessHandle.close();

        // Notify success
        self.postMessage({ success: true });
    } catch (error: any) {
        // Notify failure
        self.postMessage({
            success: false,
            error: error.message || 'Unknown worker error'
        });
    }
};
