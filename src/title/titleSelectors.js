/* @flow */
import { createSelector } from 'reselect';

import { BRAND_COLOR } from '../styles';
import { getSubscriptions, getActiveNarrow, getCurrentRoute } from '../selectors';
import { foregroundColorFromBackground } from '../utils/color';
import { isStreamNarrow, isTopicNarrow } from '../utils/narrow';
import { NULL_SUBSCRIPTION } from '../nullObjects';

export const getTitleBackgroundColor = createSelector(
  getActiveNarrow,
  getSubscriptions,
  getCurrentRoute,
  (narrow, subscriptions, route) =>
    route === 'main' && (isStreamNarrow(narrow) || isTopicNarrow(narrow))
      ? (subscriptions.find(sub => narrow[0].operand === sub.name) || NULL_SUBSCRIPTION).color
      : 'transparent',
);

export const getTitleTextColor = createSelector(
  getTitleBackgroundColor,
  getActiveNarrow,
  getCurrentRoute,
  (backgroundColor, narrow, route) =>
    backgroundColor && route === 'main' && (isStreamNarrow(narrow) || isTopicNarrow(narrow))
      ? foregroundColorFromBackground(backgroundColor)
      : BRAND_COLOR,
);
