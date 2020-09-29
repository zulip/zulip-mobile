/* @flow strict-local */
import type { Narrow, Dispatch, GetState } from '../types';
import { getAuth, getUsersById, isNarrowValid, getIsHydrated } from '../selectors';
import { getMessageIdFromLink, getNarrowFromLink } from '../utils/internalLinks';
import openLink from '../utils/openLink';
import { navigateToChat } from '../nav/navActions';
import { FIRST_UNREAD_ANCHOR } from '../anchor';
import { getStreamsById } from '../subscriptions/subscriptionSelectors';
import * as api from '../api';
import { isUrlOnRealm } from '../utils/url';

/**
 * Navigate to the given narrow.
 *
 * If the narrow is invalid or narrowing is impossible, silently does nothing.
 */
export const doNarrow = (narrow: Narrow, anchor: number = FIRST_UNREAD_ANCHOR) => (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const state = getState();

  if (!isNarrowValid(state, narrow) || !getIsHydrated(state)) {
    return;
  }

  dispatch(navigateToChat(narrow));
};

export const messageLinkPress = (href: string) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const state = getState();
  const auth = getAuth(state);
  const usersById = getUsersById(state);
  const streamsById = getStreamsById(state);
  const narrow = getNarrowFromLink(href, auth.realm, usersById, streamsById);
  if (narrow) {
    const anchor = getMessageIdFromLink(href, auth.realm);
    dispatch(doNarrow(narrow, anchor));
  } else if (!isUrlOnRealm(href, auth.realm)) {
    openLink(href);
  } else {
    const url =
      (await api.tryGetFileTemporaryUrl(href, auth)) ?? new URL(href, auth.realm).toString();
    openLink(url);
  }
};
