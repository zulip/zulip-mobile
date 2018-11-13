/* @flow */
import type { Narrow, Dispatch, GetState } from '../types';
import config from '../config';
import { NULL_ARRAY, NULL_CAUGHTUP } from '../nullObjects';
import { getAuth, getUsers, getAllNarrows, isNarrowValid, getIsHydrated } from '../selectors';
import { FETCH_STATE_RESET } from '../actionConstants';
import { getMessageIdFromLink, getNarrowFromLink, isUrlInAppLink, getFullUrl } from '../utils/url';
import openLink from '../utils/openLink';
import { fetchMessagesAtFirstUnread, fetchMessagesAroundAnchor } from './fetchActions';
import { navigateToChat } from '../nav/navActions';
import { FIRST_UNREAD_ANCHOR } from '../constants';
import { getMessages } from '../directSelectors';

export const doNarrow = (narrow: Narrow, anchor: number = FIRST_UNREAD_ANCHOR) => (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const state = getState();

  if (!isNarrowValid(narrow)(state) || !getIsHydrated(state)) {
    return;
  }

  dispatch({ type: FETCH_STATE_RESET });

  const allNarrows = getAllNarrows(state);
  const messages = getMessages(state);
  const messagesForNarrow = (allNarrows[JSON.stringify(narrow)] || NULL_ARRAY).map(
    id => messages[id],
  );
  const tooFewMessages = messagesForNarrow.length < config.messagesPerRequest / 2;

  const caughtUp = state.caughtUp[JSON.stringify(narrow)] || NULL_CAUGHTUP;
  const isCaughtUp = caughtUp.newer && caughtUp.older;

  if (anchor === FIRST_UNREAD_ANCHOR && tooFewMessages && !isCaughtUp) {
    dispatch(fetchMessagesAtFirstUnread(narrow));
  } else if (anchor !== FIRST_UNREAD_ANCHOR) {
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
