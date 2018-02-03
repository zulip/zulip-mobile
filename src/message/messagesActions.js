/* @flow */
import type { Action, Narrow, Dispatch, GetState } from '../types';
import config from '../config';
import { NULL_ARRAY, NULL_CAUGHTUP } from '../nullObjects';
import { getAuth, getUsers, getAllMessages, getStreams } from '../selectors';
import { SWITCH_NARROW } from '../actionConstants';
import { getMessageIdFromLink, getNarrowFromLink, isUrlInAppLink, getFullUrl } from '../utils/url';
import openLink from '../utils/openLink';
import { fetchMessagesAtFirstUnread, fetchMessagesAroundAnchor } from './fetchActions';
import { validateNarrow } from '../utils/narrow';
// import { showToast } from '../utils/info';

export const switchNarrow = (narrow: Narrow): Action => ({
  type: SWITCH_NARROW,
  narrow,
});

const isNarrowValid = (narrow: Narrow, getState: GetState) =>
  validateNarrow(narrow, getStreams(getState()), getUsers(getState()));

export const doNarrow = (newNarrow: Narrow): Action => (dispatch: Dispatch, getState: GetState) => {
  if (!isNarrowValid(newNarrow, getState)) return;

  dispatch(switchNarrow(newNarrow));

  const allMessages = getAllMessages(getState());
  const messagesInActiveNarrow = allMessages[JSON.stringify(newNarrow)] || NULL_ARRAY;
  const tooFewMessages = messagesInActiveNarrow.length < config.messagesPerRequest / 2;

  const caughtUp = getState().caughtUp[JSON.stringify(newNarrow)] || NULL_CAUGHTUP;
  const isCaughtUp = caughtUp.newer && caughtUp.older;

  if (tooFewMessages && !isCaughtUp) {
    dispatch(fetchMessagesAtFirstUnread(newNarrow));
  }
};

export const doNarrowAtAnchor = (newNarrow: Narrow, anchor: number): Action => (
  dispatch: Dispatch,
  getState: GetState,
) => {
  if (isNarrowValid(newNarrow, getState)) return;

  dispatch(switchNarrow(newNarrow));
  dispatch(fetchMessagesAroundAnchor(newNarrow, anchor));
};

export const messageLinkPress = (href: string) => (dispatch: Dispatch, getState: GetState) => {
  const state = getState();
  const auth = getAuth(state);

  if (isUrlInAppLink(href, auth.realm)) {
    const users = getUsers(state);
    const anchor = getMessageIdFromLink(href, auth.realm);
    const narrow = getNarrowFromLink(href, auth.realm, users);

    dispatch(doNarrowAtAnchor(narrow, anchor));
  } else {
    openLink(getFullUrl(href, auth.realm));
  }
};
