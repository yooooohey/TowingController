export function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

/**
 * Returns the closest next 5-minute rounded up time from current time in HH:mm format.
 * E.g., 09:21 -> 09:25, 09:25 -> 09:25
 */
export function getNextFiveMinuteTime(referenceDate: Date = new Date()): string {
  const hours = referenceDate.getHours();
  const minutes = referenceDate.getMinutes();
  const remainder = minutes % 5;
  const roundedMinutes = remainder === 0 ? minutes : minutes + (5 - remainder);

  let finalHours = hours;
  let finalMins = roundedMinutes;

  if (finalMins >= 60) {
    finalHours = (finalHours + 1) % 24;
    finalMins = 0;
  }

  return `${pad2(finalHours)}:${pad2(finalMins)}`;
}

/**
 * Adds or subtracts minutes to HH:mm, keeping within 00:00 - 23:55 bounds.
 */
export function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr || '9', 10);
  let m = parseInt(mStr || '0', 10);

  if (isNaN(h)) h = 9;
  if (isNaN(m)) m = 0;

  let totalMinutes = h * 60 + m + minutesToAdd;

  // Handle wraps across 24h day boundary
  const maxMinutesInDay = 24 * 60;
  while (totalMinutes < 0) {
    totalMinutes += maxMinutesInDay;
  }
  totalMinutes = totalMinutes % maxMinutesInDay;

  const newH = Math.floor(totalMinutes / 60);
  const newM = totalMinutes % 60;

  return `${pad2(newH)}:${pad2(newM)}`;
}

/**
 * Compares two HH:mm strings chronologically.
 */
export function compareTimes(t1: string, t2: string): number {
  if (t1 === t2) return 0;
  return t1.localeCompare(t2);
}

/**
 * Formats time for display (e.g. 09:15)
 */
export function formatTime(timeStr: string): string {
  if (!timeStr) return '--:--';
  return timeStr;
}
