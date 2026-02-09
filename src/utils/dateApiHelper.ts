/**
 * Utility to handle date conversions between UI (HTML5 date input) and API (Laravel backend).
 */

/**
 * Converts YYYY-MM-DD (UI) to DD/MM/YYYY (API)
 */
export const toApiDate = (uiDate?: string): string => {
  if (!uiDate) return "";

  if (/^\d{2}\/\d{2}\/\d{4}/.test(uiDate)) {
    return uiDate;
  }

  const parts = uiDate.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }

  return "";
};


/**
 * Converts DD/MM/YYYY (API) or ISO (API) to YYYY-MM-DD (UI)
 */
export const toUiDate = (apiDate?: string): string => {
  if (!apiDate) return "";

  if (/^\d{4}-\d{2}-\d{2}/.test(apiDate)) {
    return apiDate.substring(0, 10);
  }

  const parts = apiDate.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return "";
};
