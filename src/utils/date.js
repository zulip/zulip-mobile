/* @flow strict-local */
import format from 'date-fns/format';
import isToday from 'date-fns/isToday';
import isYesterday from 'date-fns/isYesterday';
import isSameYear from 'date-fns/isSameYear';
import addMinutes from 'date-fns/addMinutes';
// $FlowFixMe[untyped-import]
import tz from 'timezone/loaded';

export { default as isSameDay } from 'date-fns/isSameDay';

/**
 * If in tests, adjust the date to roughly pretend the timezone is UTC.
 *
 * When not in tests, this function just returns its argument.
 *
 * When in tests, it returns an adjusted `Date` which, in the timezone we're
 * actually using, will hopefully give the same answers on methods like
 * `getHours` as the original `Date` would give in the UTC timezone, and so
 * libraries like `date-fns/format` will produce the same results as they
 * would on the original `Date` in the UTC timezone.
 *
 * Normalizing those results to UTC, in turn, helps us get consistent
 * results for snapshot tests.
 *
 * In general what this function aims to do is impossible.  In particular,
 * in places with daylight savings time (aka summer time), the local time
 * skips an hour each spring; so for example there is no time at all that
 * was 2021-03-14 02:30 (or any other time from 02:00 to before 03:00) in
 * America/New_York, and so if the current timezone is America/New_York and
 * the given `Date` is 2021-03-14 02:30Z (i.e., 2021-03-13 21:30 in
 * America/New_York) then there is no valid result this function could
 * return.
 *
 * So while this function makes a reasonable effort, there's a window around
 * any time when the offset changes for the current timezone (in particular,
 * around the start and end of DST / summer time) in which the result may
 * not be right.
 *
 * That's OK because the function only does anything in tests (for actual
 * users, we want to use the ambient timezone anyway), plus in tests we do
 * our best to make the timezone in use be UTC in the first place.  See note
 * in `jest/globalSetup.js` where we do that.
 */
// For more background on how this works, see discussion:
//   https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/Snapshot.20tests/near/1167545
function maybePretendUtc(date: Date): Date {
  /* eslint-disable operator-linebreak */
  /* eslint-disable-next-line no-underscore-dangle */
  return global.__TEST__
    ? // Negate the UTC offset, using an offset we get from `date` itself, so
      // it'll be correct for DST-type changes through the year.
      // Empirically, the sign seems to be correct:
      //   https://github.com/zulip/zulip-mobile/pull/4670#discussion_r648702356
      addMinutes(date, date.getTimezoneOffset())
    : date;
}

export const shortTime = (date: Date, twentyFourHourTime: boolean = false): string =>
  format(maybePretendUtc(date), twentyFourHourTime ? 'H:mm' : 'h:mm a');

export const shortDate = (date: Date): string => format(date, 'MMM d');

export const longDate = (date: Date): string => format(date, 'MMM d, yyyy');

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
