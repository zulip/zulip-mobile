/* @flow strict-local */
import * as NavigationService from '../nav/NavigationService';
import type { Narrow, Dispatch, GetState } from '../types';
import { getAuth, getAllUsersById } from '../selectors';
import { getMessageIdFromLink, getNarrowFromLink } from '../utils/internalLinks';
import openLink from '../utils/openLink';
import { navigateToChat } from '../nav/navActions';
import { FIRST_UNREAD_ANCHOR } from '../anchor';
import { getStreamsById } from '../subscriptions/subscriptionSelectors';
import * as api from '../api';
import { isUrlOnRealm } from '../utils/url';
import { getOwnUserId } from '../users/userSelectors';

/**
 * Navigate to the given narrow.
 */
export const doNarrow = (narrow: Narrow, anchor: number = FIRST_UNREAD_ANCHOR) => (
  dispatch: Dispatch,
  getState: GetState,
) => {
  // TODO: Use `anchor` to open the message list to a particular message.
  NavigationService.dispatch(navigateToChat(narrow));
};

export const messageLinkPress = (href: string) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const state = getState();
  const auth = getAuth(state);
  const allUsersById = getAllUsersById(state);
  const streamsById = getStreamsById(state);
  const ownUserId = getOwnUserId(state);
  const narrow = getNarrowFromLink(href, auth.realm, allUsersById, streamsById, ownUserId);
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
