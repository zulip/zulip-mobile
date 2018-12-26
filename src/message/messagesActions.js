/* @flow strict-local */
import type { Narrow, Dispatch, GetState } from '../types';
import { getAuth, getUsersById, isNarrowValid, getIsHydrated } from '../selectors';
import { DO_NARROW } from '../actionConstants';
import { getFullUrl } from '../utils/url';
import { getMessageIdFromLink, getNarrowFromLink, isInternalLink } from '../utils/internalLinks';
import openLink from '../utils/openLink';
import { fetchMessagesInNarrow } from './fetchActions';
import { navigateToChat } from '../nav/navActions';
import { FIRST_UNREAD_ANCHOR } from '../constants';

/**
 * Navigate to the given narrow, while fetching any data needed.
 *
 * Also does other things we should always do when navigating to a narrow.
 *
 * If the narrow is invalid or narrowing is impossible, silently does nothing.
 *
 * See `MessagesState` for background about the fetching, including why this
 * is nearly the only navigation in the app where additional data fetching
 * is required.  See `fetchMessagesInNarrow` for more details.
 */
export const doNarrow = (narrow: Narrow, anchor: number = FIRST_UNREAD_ANCHOR) => (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const state = getState();

  if (!isNarrowValid(narrow)(state) || !getIsHydrated(state)) {
    return;
  }

  dispatch({ type: DO_NARROW, narrow });
  dispatch(fetchMessagesInNarrow(narrow, anchor));
  dispatch(navigateToChat(narrow));
};

export const messageLinkPress = (href: string) => (dispatch: Dispatch, getState: GetState) => {
  const state = getState();
  const auth = getAuth(state);

  if (isInternalLink(href, auth.realm)) {
    const usersById = getUsersById(state);
    const anchor = getMessageIdFromLink(href, auth.realm);
    const narrow = getNarrowFromLink(href, auth.realm, usersById);

    dispatch(doNarrow(narrow, anchor));
  } else {
    openLink(getFullUrl(href, auth.realm));
  }
};
