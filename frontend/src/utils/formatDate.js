export function formatDatePHT(dateString) {
  if (!dateString) return "";

  // Handle year-only format (e.g., "2025" for yearly option)
  if (typeof dateString === 'string' && /^\d{4}$/.test(dateString)) {
    return dateString;
  }

  // Handle year-month format (e.g., "2025-1" or "2025-01" for monthly option)
  if (typeof dateString === 'string' && /^\d{4}-\d{1,2}$/.test(dateString)) {
    const [year, month] = dateString.split('-');
    const monthIndex = parseInt(month, 10) - 1;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[monthIndex]} ${year}`;
  }

  // Check if it's a date-only string (YYYY-MM-DD format)
  const isDateOnly = typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString);
  
  if (isDateOnly) {
    // For date-only strings, return date without time
    const date = new Date(dateString);
    if (isNaN(date)) return dateString; // fallback if invalid date
    
    return date.toLocaleDateString("en-US", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // For other date formats (with time), format with time
  const date = new Date(dateString); // handles MongoDB ISO format
  if (isNaN(date)) return dateString; // fallback if invalid date

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
