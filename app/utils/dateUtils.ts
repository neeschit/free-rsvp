/**
 * Calculates the date of the next occurrence of a specific day of the week.
 * 
 * @param currentDate The starting date.
 * @param targetDayOfWeek The target day of the week (0 for Sunday, 1 for Monday, ..., 6 for Saturday).
 * @returns A Date object representing the next occurrence of the target day of the week.
 */
export function getNextDayOfWeek(currentDate: Date, targetDayOfWeek: number): Date {
  const resultDate = new Date(currentDate.getTime());
  const currentDayOfWeek = resultDate.getDay();
  
  let daysToAdd = targetDayOfWeek - currentDayOfWeek;
  
  // If the target day is today or earlier in the week, add 7 days to get the next week's occurrence
  if (daysToAdd <= 0) {
    daysToAdd += 7;
  }
  
  resultDate.setDate(resultDate.getDate() + daysToAdd);
  
  return resultDate;
}

/**
 * Adds a specified number of days to a given date.
 * 
 * @param date The starting date.
 * @param days The number of days to add (can be negative).
 * @returns A new Date object with the days added.
 */
export function addDays(date: Date, days: number): Date {
  const resultDate = new Date(date.getTime());
  resultDate.setDate(resultDate.getDate() + days);
  return resultDate;
}

/**
 * Adds a specified number of weeks to a given date.
 * 
 * @param date The starting date.
 * @param weeks The number of weeks to add (can be negative).
 * @returns A new Date object with the weeks added.
 */
export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

/**
 * Adds a specified number of months to a given date.
 * 
 * @param date The starting date.
 * @param months The number of months to add (can be negative).
 * @returns A new Date object with the months added.
 */
export function addMonths(date: Date, months: number): Date {
  const resultDate = new Date(date.getTime());
  resultDate.setMonth(resultDate.getMonth() + months);
  // Handle cases where the day of the month doesn't exist in the target month
  // (e.g., adding 1 month to Jan 31st should result in Feb 28th/29th)
  if (resultDate.getDate() !== date.getDate()) {
    resultDate.setDate(0); // Sets the date to the last day of the previous month
  }
  return resultDate;
} 