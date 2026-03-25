const buildUiAvatar = (name?: string) => {
    const safeName = name && name.trim().length ? name : "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        safeName
    )}&background=5FA8D3&color=fff&bold=true`;
};

export const getFullImageUrl = (path?: any) => {
    if (!path || typeof path !== "string" || path === "null" || path === "undefined") return undefined;

    // If it's already a full URL, return it.
    if (path.startsWith("http")) return path;

    // Normalize common Laravel storage prefixes.
    let cleanPath = path;
    if (cleanPath.startsWith("/storage/app/public/")) cleanPath = cleanPath.substring(20);
    else if (cleanPath.startsWith("storage/app/public/")) cleanPath = cleanPath.substring(19);
    else if (cleanPath.startsWith("/storage/")) cleanPath = cleanPath.substring(9);
    else if (cleanPath.startsWith("storage/")) cleanPath = cleanPath.substring(8);
    else if (cleanPath.startsWith("/")) cleanPath = cleanPath.substring(1);

    const BASE_URL = "https://sanay3i.net/storage/app/public/";
    return `${BASE_URL}${cleanPath}`;
};

export const getAvatarUrl = (path?: string | null, name?: string) => {
    return getFullImageUrl(path) || buildUiAvatar(name);
};
