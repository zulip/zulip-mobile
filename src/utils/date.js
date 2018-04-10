/* @flow */
import format from 'date-fns/format';
import isToday from 'date-fns/is_today';
import isYesterday from 'date-fns/is_yesterday';
import isSameYear from 'date-fns/is_same_year';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import differenceInSeconds from 'date-fns/difference_in_seconds';

import type { Presence } from '../types';

export { default as isSameDay } from 'date-fns/is_same_day';

export const shortTime = (date: Date, twentyFourHourTime: boolean = false): string =>
  format(date, twentyFourHourTime ? 'H:mm' : 'h:mm A');

export const shortDate = (date: Date): string => format(date, 'MMM D');

export const longDate = (date: Date): string => format(date, 'MMM D, YYYY');

export const daysInDate = (date: Date): number => Math.trunc(date / 1000 / 60 / 60 / 24);

export const humanDate = (date: Date): string => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';

  return isSameYear(new Date(date), new Date()) ? shortDate(date) : longDate(date);
};

export const presenceToHumanTime = (presence: Presence): string => {
  if (!presence || !presence.aggregated) return 'never';

  const lastTimeActive = new Date(presence.aggregated.timestamp * 1000);
  return differenceInSeconds(Date.now(), lastTimeActive) < 60
    ? 'now'
    : `${distanceInWordsToNow(lastTimeActive)} ago`;
};
