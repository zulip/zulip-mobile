/* @flow */
import { createSelector } from 'reselect';

import type { Narrow } from '../types';
import { BRAND_COLOR } from '../styles';
import { getSubscriptions } from '../directSelectors';
import { foregroundColorFromBackground } from '../utils/color';
import { isStreamOrTopicNarrow } from '../utils/narrow';
import { NULL_SUBSCRIPTION } from '../nullObjects';

/**
 * Background color to use for the app bar in narrow `narrow`.
 *
 * If `narrow` is a stream or topic narrow, this is based on the stream color.
 * Otherwise, it takes a default value.
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

/**
 * Text color to use for the app bar over `getTitleBackgroundColor(narrow)`.
 */
export const getTitleTextColor = (narrow?: Narrow) =>
  createSelector(
    getTitleBackgroundColor(narrow),
    backgroundColor =>
      backgroundColor && isStreamOrTopicNarrow(narrow)
        ? foregroundColorFromBackground(backgroundColor)
        : BRAND_COLOR,
  );
