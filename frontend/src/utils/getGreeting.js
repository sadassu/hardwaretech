/**
 * Get time-based greeting based on current hour
 * @returns {string} Greeting message
 */
export function getTimeBasedGreeting() {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  } else if (hour >= 17 && hour < 21) {
    return "Good Evening";
  } else {
    return "Good Night";
  }
}

/**
 * Get role-specific greeting message
 * @param {string[]} roles - User roles
 * @returns {string} Role-specific greeting
 */
export function getRoleGreeting(roles = []) {
  const timeGreeting = getTimeBasedGreeting();
  
  if (roles.includes("admin")) {
    return `${timeGreeting}, Administrator`;
  } else if (roles.includes("cashier")) {
    return `${timeGreeting}, Cashier`;
  }
  
  return timeGreeting;
}

/**
 * Get formatted timezone string
 * @returns {string} Formatted timezone (e.g., "Asia/Manila (PHT)")
 */
export function getTimezoneString() {
  return "Asia/Manila (PHT)";
}

/**
 * Get current time in PHT timezone
 * @returns {string} Formatted time string
 */
export function getCurrentTimePHT() {
  const now = new Date();
  return now.toLocaleString("en-US", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

