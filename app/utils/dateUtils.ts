/**
 * Calculates the date of the next occurrence of a specific day of the week.
 */
export function getNextDayOfWeek(currentDate: Date, targetDayOfWeek: number): Date {
  const resultDate = new Date(currentDate.getTime());
  const currentDayOfWeek = resultDate.getDay();

  let daysToAdd = targetDayOfWeek - currentDayOfWeek;
  if (daysToAdd <= 0) {
    daysToAdd += 7;
  }

  resultDate.setDate(resultDate.getDate() + daysToAdd);
  return resultDate;
}

/** Adds a specified number of days to a given date. */
export function addDays(date: Date, days: number): Date {
  const resultDate = new Date(date.getTime());
  resultDate.setDate(resultDate.getDate() + days);
  return resultDate;
}

/** Adds a specified number of weeks to a given date. */
export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

/** Adds a specified number of months to a given date. */
export function addMonths(date: Date, months: number): Date {
  const resultDate = new Date(date.getTime());
  resultDate.setMonth(resultDate.getMonth() + months);
  if (resultDate.getDate() !== date.getDate()) {
    resultDate.setDate(0);
  }
  return resultDate;
}
