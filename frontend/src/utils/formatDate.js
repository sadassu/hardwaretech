export function formatDatePHT(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  // Convert to PHT (Asia/Manila)
  const options = {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  let formatted = date.toLocaleDateString("en-US", options);

  // Check if original date string has a time part
  const hasTime = dateString.includes("T") || dateString.includes(":");

  if (hasTime) {
    const timeOptions = {
      timeZone: "Asia/Manila",
      hour: "2-digit",
      minute: "2-digit",
    };
    formatted +=
      " " + date.toLocaleTimeString("en-US", timeOptions).replace(/:00 /, " ");
  }

  return formatted;
}
