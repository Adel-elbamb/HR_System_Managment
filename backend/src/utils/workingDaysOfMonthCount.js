export const countWorkingDays = ({
  weekendNames = ["Saturday", "Sunday"],
  holidays = [],
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1, // 1-based (1 = January)
}) => {
  const dayNameToIndex = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const weekendIndexes = weekendNames.map((name) => dayNameToIndex[name]);

  // Filter holidays that match the same year and month
  const filteredHolidays = holidays.filter((dateStr) => {
    const d = new Date(dateStr);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });

  const holidaySet = new Set(
    filteredHolidays.map((d) => new Date(d).toISOString().split("T")[0])
  );

  let workingDays = 0;
  const date = new Date(year, month - 1, 1); // convert month to 0-based
  const monthLength = new Date(year, month, 0).getDate();

  for (let day = 1; day <= monthLength; day++) {
    date.setDate(day);
    const dayOfWeek = date.getDay();
    const dateKey = date.toISOString().split("T")[0];

    const isWeekend = weekendIndexes.includes(dayOfWeek);
    const isHoliday = holidaySet.has(dateKey);

    if (!isWeekend && !isHoliday) {
      workingDays++;
    }
  }

  return workingDays;
};
