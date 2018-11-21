/* @flow */
import { createSelector } from 'reselect';

import type { Narrow, Selector } from '../types';
import { getSubscriptions } from '../directSelectors';
import { isStreamOrTopicNarrow } from '../utils/narrow';
import { NULL_SUBSCRIPTION } from '../nullObjects';

export const DEFAULT_TITLE_BACKGROUND_COLOR = 'transparent';

/**
 * Background color to use for the app bar in narrow `narrow`.
 *
 * If `narrow` is a stream or topic narrow, this is based on the stream color.
 * Otherwise, it takes a default value.
 */
export const getTitleBackgroundColor = (narrow?: Narrow): Selector<string> =>
  createSelector(
    getSubscriptions,
    subscriptions =>
      isStreamOrTopicNarrow(narrow)
        ? (
            subscriptions.find(sub => Array.isArray(narrow) && narrow[0].operand === sub.name)
            || NULL_SUBSCRIPTION
          ).color
        : DEFAULT_TITLE_BACKGROUND_COLOR,
  );
