/**
 * Forces a browser download of a file from a URL.
 * This is useful for cross-origin URLs (like R2) where the 'download' attribute on <a> tags may be ignored.
 */
export const downloadFile = async (url: string, fileName: string) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Download failed:', error);
        // Fallback: Open in new tab
        window.open(url, '_blank');
    }
};
