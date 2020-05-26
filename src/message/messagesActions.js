/* @flow strict-local */
import type { Narrow, Dispatch, GetState, Message, Outbox } from '../types';
import { getAuth, getUsersById, isNarrowValid, getIsHydrated, getUserForId } from '../selectors';
import { DO_NARROW } from '../actionConstants';
import { getFullUrl } from '../utils/url';
import { getMessageIdFromLink, getNarrowFromLink } from '../utils/internalLinks';
import openLink from '../utils/openLink';
import { fetchMessagesInNarrow } from './fetchActions';
import { navigateToChat } from '../nav/navActions';
import { draftUpdate } from '../drafts/draftsActions';
import { FIRST_UNREAD_ANCHOR } from '../anchor';
import { getStreamsById } from '../subscriptions/subscriptionSelectors';
import { getDraftForNarrow } from '../drafts/draftsSelectors';

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

  if (!isNarrowValid(state, narrow) || !getIsHydrated(state)) {
    return;
  }

  dispatch({ type: DO_NARROW, narrow });
  dispatch(fetchMessagesInNarrow(narrow, anchor));
  dispatch(navigateToChat(narrow));
};

export const messageLinkPress = (href: string) => (dispatch: Dispatch, getState: GetState) => {
  const state = getState();
  const auth = getAuth(state);
  const usersById = getUsersById(state);
  const streamsById = getStreamsById(state);
  const narrow = getNarrowFromLink(href, auth.realm, usersById, streamsById);
  if (narrow) {
    const anchor = getMessageIdFromLink(href, auth.realm);
    dispatch(doNarrow(narrow, anchor));
    return;
  }
  openLink(getFullUrl(href, auth.realm));
};

export const mentionAndReply = (message: Message | Outbox, narrow: Narrow) => (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const state = getState();
  const draft = getDraftForNarrow(state, narrow);
  let replyWithUserId: boolean = false;
  if (!message.isOutbox) {
    const user = getUserForId(state, message.sender_id);
    if (!user.is_bot) {
      replyWithUserId = true;
    }
  }
  const reply = `@**${message.sender_full_name}${
    // Validity of message.sender_id is checked above. $FlowFixMe.
    replyWithUserId ? `|${message.sender_id}` : ''
  }**\n${draft}`;

  dispatch(doNarrow(narrow));
  dispatch(draftUpdate(narrow, reply));
};
