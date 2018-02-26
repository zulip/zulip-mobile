/* @flow */
import { createSelector } from 'reselect';

import { BRAND_COLOR } from '../styles';
import { getSubscriptions } from '../directSelectors';
import { getActiveNarrow, getCurrentRoute } from '../baseSelectors';
import { foregroundColorFromBackground } from '../utils/color';
import { isStreamNarrow, isTopicNarrow } from '../utils/narrow';
import { NULL_SUBSCRIPTION } from '../nullObjects';

export const getIsInTopicOrStreamNarrow = createSelector(
  getActiveNarrow,
  getCurrentRoute,
  (narrow, route) => route === 'chat' && (isStreamNarrow(narrow) || isTopicNarrow(narrow)),
);

export const getTitleBackgroundColor = createSelector(
  getActiveNarrow,
  getSubscriptions,
  getIsInTopicOrStreamNarrow,
  (narrow, subscriptions, isInTopicOrStreamNarrow) =>
    isInTopicOrStreamNarrow
      ? (subscriptions.find(sub => narrow[0].operand === sub.name) || NULL_SUBSCRIPTION).color
      : 'transparent',
);

export const getTitleTextColor = createSelector(
  getTitleBackgroundColor,
  getActiveNarrow,
  getIsInTopicOrStreamNarrow,
  (backgroundColor, narrow, isInTopicOrStreamNarrow) =>
    backgroundColor && isInTopicOrStreamNarrow
      ? foregroundColorFromBackground(backgroundColor)
      : BRAND_COLOR,
);
