/* @flow strict-local */
import * as NavigationService from '../nav/NavigationService';
import type { Narrow, ThunkAction } from '../types';
import { getAuth } from '../selectors';
import { getMessageIdFromLink, getNarrowFromLink } from '../utils/internalLinks';
import { openLinkWithUserPreference } from '../utils/openLink';
import { navigateToChat } from '../nav/navActions';
import { FIRST_UNREAD_ANCHOR } from '../anchor';
import { getStreamsById, getStreamsByName } from '../subscriptions/subscriptionSelectors';
import * as api from '../api';
import { isUrlOnRealm } from '../utils/url';
import { getOwnUserId } from '../users/userSelectors';

/**
 * Navigate to the given narrow.
 */
export const doNarrow = (
  narrow: Narrow,
  anchor: number = FIRST_UNREAD_ANCHOR,
): ThunkAction<void> => (dispatch, getState) => {
  // TODO: Use `anchor` to open the message list to a particular message.
  NavigationService.dispatch(navigateToChat(narrow));
};

export const messageLinkPress = (href: string): ThunkAction<Promise<void>> => async (
  dispatch,
  getState,
  { getGlobalSettings },
) => {
  const state = getState();
  const auth = getAuth(state);
  const streamsById = getStreamsById(state);
  const streamsByName = getStreamsByName(state);
  const ownUserId = getOwnUserId(state);
  const narrow = getNarrowFromLink(href, auth.realm, streamsById, streamsByName, ownUserId);
  // TODO: In some cases getNarrowFromLink successfully parses the link, but
  //   finds it points somewhere we can't see: in particular, to a stream
  //   that's hidden from our user (perhaps doesn't exist.)  For those,
  //   perhaps give an error instead of falling back to opening in browser,
  //   which should be futile.
  if (narrow) {
    const anchor = getMessageIdFromLink(href, auth.realm);
    dispatch(doNarrow(narrow, anchor));
  } else if (!isUrlOnRealm(href, auth.realm)) {
    openLinkWithUserPreference(href, getGlobalSettings());
  } else {
    const url =
      (await api.tryGetFileTemporaryUrl(href, auth)) ?? new URL(href, auth.realm).toString();
    openLinkWithUserPreference(url, getGlobalSettings());
  }
};
