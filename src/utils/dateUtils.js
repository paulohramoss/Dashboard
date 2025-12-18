import { startOfDay, endOfDay, isValid } from "date-fns";
import { format as formatTz } from "date-fns-tz";
import { ptBR, enUS } from "date-fns/locale";

// Get the user's local timezone
export const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

// Map for locales
const locales = {
  pt: ptBR,
  en: enUS,
  "pt-BR": ptBR,
  "en-US": enUS,
};

const getLocale = () => {
  const savedLang = localStorage.getItem("i18nextLng") || "pt";
  // Clean up language string (e.g. 'pt-BR' -> 'pt' if needed, or matches existing keys)
  // Our simple map handles 'pt' and 'pt-BR'
  return locales[savedLang] || ptBR;
};

/**
 * Format a date with timezone awareness
 * @param {Date|string|number} date - Date to format
 * @param {string} pattern - Format pattern (e.g. 'dd/MM/yyyy')
 * @param {string} [timeZone] - Optional timezone, defaults to user's local
 */
export const formatDate = (date, pattern = "dd/MM/yyyy", timeZone = null) => {
  if (!date) return "";
  const d = new Date(date);
  if (!isValid(d)) return ""; // Fail gracefully for invalid dates

  const tz = timeZone || getUserTimezone();
  const locale = getLocale();

  // Use date-fns-tz format function which handles IANA timezones
  return formatTz(d, pattern, { timeZone: tz, locale });
};

/**
 * Get accurate Start of Day in proper timezone
 * Helps avoiding issues where 00:00 becomes 23:00 previous day in UTC
 */
export const getSafeStartOfDay = (date) => {
  return startOfDay(date);
};

/**
 * Get accurate End of Day
 */
export const getSafeEndOfDay = (date) => {
  return endOfDay(date);
};

/**
 * Helper to ensure a date string (YYYY-MM-DD from inputs) is treated as Local start of day
 * instead of UTC.
 */
export const parseInputDate = (dateString) => {
  if (!dateString) return new Date();
  // Appends T00:00:00 to ensure it's treated as local day start,
  // preventing timezone shifts if parsed as UTC
  return new Date(`${dateString}T00:00:00`);
};
