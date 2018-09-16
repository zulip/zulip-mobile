/* @flow */
import { createSelector } from 'reselect';

import type { Narrow } from '../types';
import { BRAND_COLOR } from '../styles';
import { getSubscriptions } from '../directSelectors';
import { getCurrentRouteName } from '../nav/navSelectors';
import { foregroundColorFromBackground } from '../utils/color';
import { isStreamNarrow, isTopicNarrow } from '../utils/narrow';
import { NULL_SUBSCRIPTION } from '../nullObjects';

export const getIsInTopicOrStreamNarrow = (narrow?: Narrow) =>
  createSelector(
    getCurrentRouteName,
    routeName => (routeName === 'chat' ? isStreamNarrow(narrow) || isTopicNarrow(narrow) : false),
  );

/** (If `narrow` omitted, returns 'transparent'.) */
export const getTitleBackgroundColor = (narrow?: Narrow) =>
  createSelector(
    getSubscriptions,
    getIsInTopicOrStreamNarrow(narrow),
    (subscriptions, isInTopicOrStreamNarrow) =>
      isInTopicOrStreamNarrow
        ? (
            subscriptions.find(sub => Array.isArray(narrow) && narrow[0].operand === sub.name)
            || NULL_SUBSCRIPTION
          ).color
        : 'transparent',
  );

/** (If `narrow` omitted, returns BRAND_COLOR.) */
export const getTitleTextColor = (narrow?: Narrow) =>
  createSelector(
    getTitleBackgroundColor(narrow),
    getIsInTopicOrStreamNarrow(narrow),
    (backgroundColor, isInTopicOrStreamNarrow) =>
      backgroundColor && isInTopicOrStreamNarrow
        ? foregroundColorFromBackground(backgroundColor)
        : BRAND_COLOR,
  );
