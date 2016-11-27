import moment from 'moment';

export const shortTime = (date: Date, twentyFourHourTime): string =>
  moment(date).format(twentyFourHourTime ? 'H:MM' : 'h:MM A');

export const shortDate = (date: Date): string =>
  moment(date).format('MMM D');

export const longDate = (date: Date): string =>
  moment(date).format('ll');

export const daysInDate = (date: Date): number =>
  Math.trunc(date / 1000 / 60 / 60 / 24);

export const isSameDay = (date1: Date, date2: Date): boolean =>
  daysInDate(date1) === daysInDate(date2);

export const isSameYear = (date1: Date, date2: Date): boolean =>
  date1.getYear() === date2.getYear();

export const isToday = (date: Date): boolean =>
  daysInDate(Date.now()) === daysInDate(date);

export const isYesterday = (date: Date): boolean =>
  daysInDate(Date.now()) - daysInDate(date) === 1;

export const humanDate = (date: Date): string => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';

  return isSameYear(new Date(date), new Date()) ? shortDate(date) : longDate(date);
};
