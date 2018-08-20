/* @flow */
import type { Narrow, Dispatch, GetState } from '../types';
import config from '../config';
import { NULL_ARRAY, NULL_CAUGHTUP } from '../nullObjects';
import { getAuth, getUsers, getAllMessages, isNarrowValid, getIsHydrated } from '../selectors';
import { FETCH_STATE_RESET } from '../actionConstants';
import { getMessageIdFromLink, getNarrowFromLink, isUrlInAppLink, getFullUrl } from '../utils/url';
import openLink from '../utils/openLink';
import { fetchMessagesAtFirstUnread, fetchMessagesAroundAnchor } from './fetchActions';
import { navigateToChat } from '../actions';

export const doNarrow = (narrow: Narrow, anchor: number = 0) => (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const state = getState();

  if (!isNarrowValid(narrow)(state) || !getIsHydrated(state)) {
    return;
  }

  dispatch({ type: FETCH_STATE_RESET });
  dispatch(navigateToChat(narrow));

  const allMessages = getAllMessages(state);
  const messagesForNarrow = allMessages[JSON.stringify(narrow)] || NULL_ARRAY;
  const tooFewMessages = messagesForNarrow.length < config.messagesPerRequest / 2;

  const caughtUp = state.caughtUp[JSON.stringify(narrow)] || NULL_CAUGHTUP;
  const isCaughtUp = caughtUp.newer && caughtUp.older;

  if (anchor === 0 && tooFewMessages && !isCaughtUp) {
    dispatch(fetchMessagesAtFirstUnread(narrow));
  } else if (anchor !== 0) {
    dispatch(fetchMessagesAroundAnchor(narrow, anchor));
  }
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
