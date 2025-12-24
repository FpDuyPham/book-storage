/// <reference lib="webworker" />

self.onmessage = async (e: MessageEvent) => {
    const { fileHandle, arrayBuffer } = e.data;

    try {
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
