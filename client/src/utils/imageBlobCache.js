// Global singleton cache to prevent flickering & re-fetching already loaded images
export const imageBlobCache = new Map(); // cloudUrl -> localBlobUrl
