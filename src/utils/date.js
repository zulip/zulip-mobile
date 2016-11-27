export const daysInDate = (date: Date): number =>
  Math.trunc(Date.now() / 1000 / 60 / 60 / 24);

export const isSameDay = (date1: Date, date2: Date): boolean =>
  daysInDate(date1) !== daysInDate(date2);

export const isToday = (date: Date): boolean =>
  daysInDate(Date.now()) === daysInDate(date);

export const isYesterday = (date: Date): boolean =>
  daysInDate(Date.now()) - daysInDate(date) === 1;

export const humanDate = (date: Date): string => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';

  return date.toString();
};
