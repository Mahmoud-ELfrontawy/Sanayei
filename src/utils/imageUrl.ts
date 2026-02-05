export const getFullImageUrl = (path?: string | null) => {
    if (!path) return undefined;
    
    // If it's already a full URL, return it (but add timestamp if needed?)
    // Usually full URLs are external (Google auth) or fully qualified S3/Storage URLs.
    if (path.startsWith("http")) return path;

    const IMAGE_BASE_URL = "https://sanay3i.net/storage/app/public/";
    
    // Remove leading slash to prevent double slashes (though browsers handle it, it's cleaner)
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    
    // Add timestamp for cache busting
    return `${IMAGE_BASE_URL}${cleanPath}?t=${Date.now()}`;
};
