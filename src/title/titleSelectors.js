/* @flow */
import { createSelector } from 'reselect';

import { BRAND_COLOR } from '../styles';
import { getSubscriptions, getActiveNarrow } from '../selectors';
import { foregroundColorFromBackground } from '../utils/color';
import { isStreamNarrow, isTopicNarrow } from '../utils/narrow';
import { NULL_SUBSCRIPTION } from '../nullObjects';

// const flattenStyle = StyleSheet.flatten(styles.navBar);

export const getTitleBackgroundColor = createSelector(
  getActiveNarrow,
  getSubscriptions,
  (narrow, subscriptions) =>
    isStreamNarrow(narrow) || isTopicNarrow(narrow)
      ? (subscriptions.find(sub => narrow[0].operand === sub.name) || NULL_SUBSCRIPTION).color
      : 'transparent',
);

export const getTitleTextColor = createSelector(
  getTitleBackgroundColor,
  getActiveNarrow,
  (backgroundColor, narrow) =>
    backgroundColor && (isStreamNarrow(narrow) || isTopicNarrow(narrow))
      ? foregroundColorFromBackground(backgroundColor)
      : BRAND_COLOR,
);
