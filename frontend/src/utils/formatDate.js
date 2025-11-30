export function formatDatePHT(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString); // handles MongoDB ISO format
  if (isNaN(date)) return dateString; // fallback if invalid date

  // Check if it's a date-only string (YYYY-MM-DD format) or includes time
  const isDateOnly = typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString);
  
  if (isDateOnly) {
    // For date-only strings, return date without time
    return date.toLocaleDateString("en-US", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return date
    .toLocaleString("en-US", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(/:00 /, " "); // remove seconds
}
