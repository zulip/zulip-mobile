/* @flow */
import type { Action, Narrow, Dispatch, GetState } from '../types';
import { NULL_CAUGHTUP } from '../nullObjects';
import { getAuth, getUsers, getAllMessages, getStreams } from '../selectors';
import { EVENT_UPDATE_MESSAGE_FLAGS, SWITCH_NARROW } from '../actionConstants';
import { getMessageIdFromLink, getNarrowFromLink, isUrlInAppLink, getFullUrl } from '../utils/url';
import openLink from '../utils/openLink';
import { fetchMessagesAtFirstUnread } from './fetchActions';
import { validateNarrow } from '../utils/narrow';
// import { showToast } from '../utils/info';
import { markAsRead } from '../api';

let unsentMessageIds = [];
let isMarkAsReadLooping = false;

export const switchNarrow = (narrow: Narrow): Action => ({
  type: SWITCH_NARROW,
  narrow,
});

export const doNarrow = (newNarrow: Narrow, anchor: number = Number.MAX_SAFE_INTEGER): Action => (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const isValidNarrow = validateNarrow(newNarrow, getStreams(getState()), getUsers(getState()));

  if (!isValidNarrow) {
    // show message to user that narrow is outdated now
    // showToast('Invalid narrow');
    return;
  }
  dispatch(switchNarrow(newNarrow));

  const anyMessagesInNewNarrow = JSON.stringify(newNarrow) in getAllMessages(getState());
  const caughtUp = getState().caughtUp[newNarrow] || NULL_CAUGHTUP;

  if (!anyMessagesInNewNarrow && !caughtUp.newer && !caughtUp.older) {
    dispatch(fetchMessagesAtFirstUnread(newNarrow));
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

export const addReadFlagToMessages = (messageIds: number[]): Action => ({
  type: EVENT_UPDATE_MESSAGE_FLAGS,
  messages: messageIds,
  flag: 'read',
  operation: 'add',
});

export const markMessageAsReadQueue = () => async (dispatch: Dispatch, getState: GetState) => {
  // loop to mark message as read
  // eslint-disable-next-line no-constant-condition
  while (true) {
    dispatch(addReadFlagToMessages(unsentMessageIds));
    markAsRead(getAuth(getState()), unsentMessageIds);
    unsentMessageIds = [];
    // eslint-disable-next-line no-await-in-loop
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (unsentMessageIds.length === 0) {
      isMarkAsReadLooping = false;
      break;
    }
  }
};

export const addMessagesToQueue = (messageIds: number[]): Action => (
  dispatch: Dispatch,
  getState: GetState,
) => {
  unsentMessageIds.push(...messageIds);
  if (!isMarkAsReadLooping) {
    // start loop
    dispatch(markMessageAsReadQueue());
    isMarkAsReadLooping = true;
  }
};
