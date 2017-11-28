/* @flow */
import type { Action, Narrow, Dispatch, GetState } from '../types';
import { NULL_CAUGHTUP } from '../nullObjects';
import { getAuth, getUsers, getAllMessages } from '../selectors';
import { SWITCH_NARROW } from '../actionConstants';
import { getMessageIdFromLink, getNarrowFromLink, isUrlInAppLink, getFullUrl } from '../utils/url';
import openLink from '../utils/openLink';
import { fetchMessagesAtFirstUnread } from './fetchActions';

export const switchNarrow = (narrow: Narrow): Action => ({
  type: SWITCH_NARROW,
  narrow,
});

export const doNarrow = (newNarrow: Narrow, anchor: number = Number.MAX_SAFE_INTEGER): Action => (
  dispatch: Dispatch,
  getState: GetState,
) => {
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
