/* @flow strict-local */
import { createSelector } from 'reselect';

import type {
  Message,
  PmConversationData,
  RecentPrivateConversation,
  Selector,
  User,
  UserOrBot,
} from '../types';
import { getServerVersion } from '../account/accountsSelectors';
import { getPrivateMessages } from '../message/messageSelectors';
import { getRecentPrivateConversations } from '../directSelectors';
import { getOwnUser, getAllUsersById } from '../users/userSelectors';
import { getUnreadByPms, getUnreadByHuddles } from '../unread/unreadSelectors';
import { normalizeRecipientsSansMe, pmUnreadsKeyFromMessage } from '../utils/recipient';
import { ZulipVersion } from '../utils/zulipVersion';

/**
 * Given a list of PmConversationPartial or PmConversationData, trim it down to
 * contain only the most recent message from any conversation, and return them
 * sorted by recency.
 */
const collateByRecipient = <T: { recipients: string, msgId: number }>(
  items: $ReadOnlyArray<T>,
): T[] => {
  const latestByRecipient = new Map();
  items.forEach(item => {
    const prev = latestByRecipient.get(item.recipients);
    if (!prev || item.msgId > prev.msgId) {
      latestByRecipient.set(item.recipients, item);
    }
  });

  const sortedByMostRecent = Array.from(latestByRecipient.values()).sort(
    (a, b) => +b.msgId - +a.msgId,
  );

  return sortedByMostRecent;
};

type PmConversationPartial = $Diff<PmConversationData, {| unread: mixed |}>;
type UnreadAttacher = ($ReadOnlyArray<PmConversationPartial>) => PmConversationData[];

/**
 * Auxiliary function: fragment of the selector(s) for PmConversationData.
 * Transforms PmConversationPartial[] to PmConversationData[].
 *
 * Note that, since this will only ever be called by other selectors, the inner
 * function doesn't need to do any memoization of its own.
 */
const getAttachUnread: Selector<UnreadAttacher> = createSelector(
  getUnreadByPms,
  getUnreadByHuddles,
  (unreadPms: { [number]: number }, unreadHuddles: { [string]: number }) => (
    partials: $ReadOnlyArray<PmConversationPartial>,
  ) =>
    partials.map(recipient => ({
      ...recipient,
      unread:
        // This business of looking in one place and then the other is kind
        // of messy.  Fortunately it always works, because the key spaces
        // are disjoint: all `unreadHuddles` keys contain a comma, and all
        // `unreadPms` keys don't.
        /* $FlowFixMe: The keys of unreadPms are logically numbers, but because it's an object they
         end up converted to strings, so this access with string keys works.  We should probably use
         a Map for this and similar maps. */
        unreadPms[recipient.ids] || unreadHuddles[recipient.ids],
    })),
);

/**
 * Legacy implementation of {@link getRecentConversations}. Computes an
 * approximation to the set of recent conversations, based on the messages we
 * already know about.
 */
const getRecentConversationsLegacyImpl: Selector<PmConversationData[]> = createSelector(
  getOwnUser,
  getPrivateMessages,
  getAttachUnread,
  (ownUser: User, messages: Message[], attachUnread: UnreadAttacher): PmConversationData[] => {
    const items = messages.map(msg => ({
      ids: pmUnreadsKeyFromMessage(msg, ownUser.user_id),
      recipients: normalizeRecipientsSansMe(msg.display_recipient, ownUser.email),
      msgId: msg.id,
    }));

    const sortedByMostRecent = collateByRecipient(items);

    return attachUnread(sortedByMostRecent);
  },
);

/**
 * Modern implementation of {@link getRecentConversations}. Returns exactly the
 * most recent conversations. Requires server-side support.
 */
const getRecentConversationsImpl: Selector<PmConversationData[]> = createSelector(
  getOwnUser,
  getAllUsersById,
  getRecentPrivateConversations,
  getAttachUnread,
  (
    ownUser: User,
    allUsers: Map<number, UserOrBot>,
    recentPCs: RecentPrivateConversation[],
    attachUnread: UnreadAttacher,
  ) => {
    const getEmail = (id: number): string => {
      const user = allUsers.get(id);
      if (user) {
        return user.email;
      }
      throw new Error('getRecentConversations: unknown user id');
    };

    const recipients = recentPCs.map(conversation => {
      const userIds = conversation.user_ids.slice();
      if (userIds.length !== 1) {
        userIds.push(ownUser.user_id);
        userIds.sort((a, b) => a - b);
      }

      return {
        ids: userIds.join(','),
        recipients: normalizeRecipientsSansMe(
          userIds.map(id => ({ email: getEmail(id) })),
          ownUser.email,
        ),
        msgId: conversation.max_message_id,
      };
    });

    return attachUnread(recipients);
  },
);

/**
 * The server version in which 'recent_private_conversations' was first made
 * available.
 */
const DIVIDING_LINE = new ZulipVersion('2.1-dev-384-g4c3c669b41');

// Private. Selector to choose between other selectors. (This avoids needlessly
// recomputing the old version when we're on a new server, or vice versa.)
const getMetaselector: Selector<Selector<PmConversationData[]>> = createSelector(
  getServerVersion,
  version => {
    // If we're talking to a new enough version of the Zulip server, we don't
    // need the legacy impl; the modern one will always return a superset of
    // its content.
    if (version && version.isAtLeast(DIVIDING_LINE)) {
      return getRecentConversationsImpl;
    }

    // If we're _not_ talking to a newer version of the Zulip server, then
    // there's no point in using the modern version; it will only return
    // messages received in the current session, which should all be in the
    // legacy impl's data as well.
    return getRecentConversationsLegacyImpl;
  },
);

/**
 * Get a list of the most recent private conversations, including the most
 * recent message from each.
 *
 * Switches between implementations as appropriate for the current server
 * version.
 */
export const getRecentConversations: Selector<PmConversationData[]> = createSelector(
  state => state,
  getMetaselector,
  (state, metaselector) => metaselector(state),
);

export const getUnreadConversations: Selector<PmConversationData[]> = createSelector(
  getRecentConversations,
  conversations => conversations.filter(c => c.unread > 0),
);
