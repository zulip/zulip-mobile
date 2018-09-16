/* @flow */
import { createSelector } from 'reselect';

import type { Narrow } from '../types';
import { BRAND_COLOR } from '../styles';
import { getSubscriptions } from '../directSelectors';
import { foregroundColorFromBackground } from '../utils/color';
import { isStreamOrTopicNarrow } from '../utils/narrow';
import { NULL_SUBSCRIPTION } from '../nullObjects';

/**
 * This selectors can be called from any screen/component to
 * get background/text color of the title (in the nav bar).
 *
 * If narrow is undefined, i.e not a chat screen then return default values
 * (in that case isStreamOrTopicNarrow will return false)
 * else return color according to the stream.
 *
 * Note: here selectors are not subscribed to nav state change
 * to get narrow in the current/chat screen, if that would have done
 * this selectors results will change when new screen is pushed over a chatscreen
 * and might cause re-render to screen which are not at the top of the stack
 *
 * @param narrow - Narrow of the screen, if is is chat screen else undefined
 */
export const getTitleBackgroundColor = (narrow?: Narrow) =>
  createSelector(
    getSubscriptions,
    subscriptions =>
      isStreamOrTopicNarrow(narrow)
        ? (
            subscriptions.find(sub => Array.isArray(narrow) && narrow[0].operand === sub.name)
            || NULL_SUBSCRIPTION
          ).color
        : 'transparent',
  );

/** See getTitleBackgroundColor; this is the foreground. */
export const getTitleTextColor = (narrow?: Narrow) =>
  createSelector(
    getTitleBackgroundColor(narrow),
    backgroundColor =>
      backgroundColor && isStreamOrTopicNarrow(narrow)
        ? foregroundColorFromBackground(backgroundColor)
        : BRAND_COLOR,
  );
