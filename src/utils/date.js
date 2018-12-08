/* @flow strict-local */
import format from 'date-fns/format';
import isToday from 'date-fns/is_today';
import isYesterday from 'date-fns/is_yesterday';
import isSameYear from 'date-fns/is_same_year';
import tz from 'timezone/loaded';

export { default as isSameDay } from 'date-fns/is_same_day';

export const shortTime = (date: Date, twentyFourHourTime: boolean = false): string =>
  format(date, twentyFourHourTime ? 'H:mm' : 'h:mm A');

export const shortDate = (date: Date): string => format(date, 'MMM D');

export const longDate = (date: Date): string => format(date, 'MMM D, YYYY');

export const daysInDate = (date: Date): number => Math.trunc(date / 1000 / 60 / 60 / 24);

export const humanDate = (date: Date): string => {
  if (isToday(date)) {
    return 'Today';
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }

  return isSameYear(new Date(date), new Date()) ? shortDate(date) : longDate(date);
};

export const nowInTimeZone = (timezone: string): string => tz(tz(new Date()), '%I:%M %p', timezone);
