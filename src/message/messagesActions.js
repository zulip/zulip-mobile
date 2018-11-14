/* @flow strict-local */
import type { Narrow, Dispatch, GetState, GlobalState } from '../types';
import config from '../config';
import { getAuth, getUsers, isNarrowValid, getIsHydrated } from '../selectors';
import { getCaughtUpForActiveNarrow } from '../caughtup/caughtUpSelectors';
import { getFetchedMessagesForNarrow } from '../chat/narrowsSelectors';
import { FETCH_STATE_RESET } from '../actionConstants';
import { getMessageIdFromLink, getNarrowFromLink, isUrlInAppLink, getFullUrl } from '../utils/url';
import openLink from '../utils/openLink';
import { fetchMessagesAtFirstUnread, fetchMessagesAroundAnchor } from './fetchActions';
import { navigateToChat } from '../nav/navActions';
import { FIRST_UNREAD_ANCHOR } from '../constants';

const needFetchAtFirstUnread = (state: GlobalState, narrow: Narrow): boolean => {
  const messagesForNarrow = getFetchedMessagesForNarrow(narrow)(state);
  const tooFewMessages = messagesForNarrow.length < config.messagesPerRequest / 2;

  const caughtUp = getCaughtUpForActiveNarrow(narrow)(state);
  const isCaughtUp = caughtUp.newer && caughtUp.older;

  return tooFewMessages && !isCaughtUp;
};

export const doNarrow = (narrow: Narrow, anchor: number = FIRST_UNREAD_ANCHOR) => (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const state = getState();

  if (!isNarrowValid(narrow)(state) || !getIsHydrated(state)) {
    return;
  }

  dispatch({ type: FETCH_STATE_RESET });

  if (anchor === FIRST_UNREAD_ANCHOR) {
    if (needFetchAtFirstUnread(state, narrow)) {
      dispatch(fetchMessagesAtFirstUnread(narrow));
    }
  } else {
    dispatch(fetchMessagesAroundAnchor(narrow, anchor));
  }

  dispatch(navigateToChat(narrow));
};

export const messageLinkPress = (href: string) => (dispatch: Dispatch, getState: GetState) => {
  const state = getState();
  const auth = getAuth(state);

  if (isUrlInAppLink(href, auth.realm)) {
    const users = getUsers(state);
    const anchor = getMessageIdFromLink(href, auth.realm);
    const narrow = getNarrowFromLink(href, auth.realm, users);

    dispatch(doNarrow(narrow, anchor));
  } else {
    openLink(getFullUrl(href, auth.realm));
  }
};
