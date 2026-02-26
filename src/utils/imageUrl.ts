const buildUiAvatar = (name?: string) => {
    const safeName = name && name.trim().length ? name : "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        safeName
    )}&background=5FA8D3&color=fff&bold=true`;
};

export const getFullImageUrl = (path?: string | null) => {
    if (!path || path === "null" || path === "undefined") return undefined;

    // If it's already a full URL, return it.
    if (path.startsWith("http")) return path;

    // Remove leading slash to prevent double slashes.
    let cleanPath = path.startsWith("/") ? path.substring(1) : path;

    // Normalize common Laravel storage prefixes.
    if (cleanPath.startsWith("storage/app/public/")) {
        cleanPath = cleanPath.substring("storage/app/public/".length);
    } else if (cleanPath.startsWith("storage/")) {
        cleanPath = cleanPath.substring("storage/".length);
    }

    const BASE_URL = "/storage/app/public/";
    return `${BASE_URL}${cleanPath}`;
};

export const getAvatarUrl = (path?: string | null, name?: string) => {
    return getFullImageUrl(path) || buildUiAvatar(name);
};
