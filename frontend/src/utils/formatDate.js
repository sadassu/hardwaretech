export function formatDatePHT(dateString) {
  if (!dateString) return "";

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
