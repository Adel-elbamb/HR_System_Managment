function getCurrentMonthDaysCount() {
  const now = new Date(); // Current date, e.g., June 11, 2025
  const year = now.getFullYear(); // 2025
  const month = now.getMonth(); // 5 (because months are 0-indexed: 0 = Jan, 5 = June)

  // Create a date: 0th day of the next month = last day of current month
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  return daysInMonth;
}

export default getCurrentMonthDaysCount;
