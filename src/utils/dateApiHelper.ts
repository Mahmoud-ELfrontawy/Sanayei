/**
 * Utility to handle date conversions between UI (HTML5 date input) and API (Laravel backend).
 */

/**
 * Converts YYYY-MM-DD (UI) to DD/MM/YYYY (API)
 */
export const toApiDate = (uiDate?: string): string | undefined => {
    if (!uiDate) return undefined;

    // نحول مباشرة إلى YYYY-MM-DD المناسب للـ Laravel
    return new Date(uiDate).toISOString().split("T")[0];
};


/**
 * Converts DD/MM/YYYY (API) or ISO (API) to YYYY-MM-DD (UI)
 */
export const toUiDate = (apiDate?: string): string => {
    if (!apiDate) return "";
    
    // Case 1: Already YYYY-MM-DD (might happen with some endpoints)
    if (/^\d{4}-\d{2}-\d{2}/.test(apiDate)) {
        return apiDate.substring(0, 10);
    }
    
    // Case 2: DD/MM/YYYY
    const parts = apiDate.split("/");
    if (parts.length === 3) {
        const [day, month, year] = parts;
        // Ensure year is 4 digits and month/day are 2 digits
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return "";
};
