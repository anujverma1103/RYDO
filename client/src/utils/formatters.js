/**
 * Formats a number as Indian Rupees without decimal places.
 *
 * @param {number} amount - Amount in rupees.
 * @returns {string}
 */
export const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);

/**
 * Formats a date for compact ride cards.
 *
 * @param {string|Date} date - Date value.
 * @returns {string}
 */
export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));

/**
 * Shortens long geocoded addresses for dense dashboard cards.
 *
 * @param {string} address - Full address.
 * @returns {string}
 */
export const shortAddress = (address = '') => {
  const parts = address.split(',').map((part) => part.trim()).filter(Boolean);
  return parts.slice(0, 2).join(', ') || address;
};

export const statusLabels = {
  pending: 'Pending',
  accepted: 'Accepted',
  started: 'Started',
  completed: 'Completed',
  cancelled: 'Cancelled'
};
