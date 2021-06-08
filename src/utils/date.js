/* @flow strict-local */
import format from 'date-fns/format';
import isToday from 'date-fns/is_today';
import isYesterday from 'date-fns/is_yesterday';
import isSameYear from 'date-fns/is_same_year';
import addMinutes from 'date-fns/add_minutes';
import tz from 'timezone/loaded';

export { default as isSameDay } from 'date-fns/is_same_day';

/**
 * Use consistent timezone (UTC) in local and CI tests, for snapshot tests.
 */
// We're only counting on this if we can't set the timezone `Date` uses to
// UTC in the first place; see note where we attempt to do that in
// jest/globalSetup.js.
function maybeAsUtc(date: Date) {
  /* eslint-disable operator-linebreak */
  /* eslint-disable-next-line id-match,no-underscore-dangle */
  return global.__TEST__
    ? // Negate the UTC offset, using an offset we get from `date` itself, so
      // it'll be correct for DST-type changes through the year.
      // Empirically, the sign seems to be correct:
      //   https://github.com/zulip/zulip-mobile/pull/4670#discussion_r648702356
      addMinutes(date, date.getTimezoneOffset())
    : date;
}

export const shortTime = (date: Date, twentyFourHourTime: boolean = false): string =>
  format(maybeAsUtc(date), twentyFourHourTime ? 'H:mm' : 'h:mm A');

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
