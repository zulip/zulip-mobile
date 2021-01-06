/* @flow strict-local */
import { createSelector } from 'reselect';

import type { GlobalState, Message, PmConversationData, Selector, User } from '../types';
import { getPrivateMessages } from '../message/messageSelectors';
import { getAllUsersById, getOwnUser } from '../users/userSelectors';
import { getUnreadByPms, getUnreadByHuddles } from '../unread/unreadSelectors';
import { pmUnreadsKeyFromMessage, pmKeyRecipientUsersFromMessage } from '../utils/recipient';
import { getServerVersion } from '../account/accountsSelectors';
import * as model from './pmConversationsModel';

function unreadCount(unreadsKey, unreadPms, unreadHuddles): number {
  // This business of looking in one place and then the other is kind
  // of messy.  Fortunately it always works, because the key spaces
  // are disjoint: all `unreadHuddles` keys contain a comma, and all
  // `unreadPms` keys don't.
  /* $FlowFixMe: The keys of unreadPms are logically numbers... but because
       it's an object, they end up converted to strings, so this access with
       string keys works.  We should probably use a Map for this and similar
       maps. */
  return unreadPms[unreadsKey] || unreadHuddles[unreadsKey];
}

// TODO(server-2.1): Delete this, and simplify logic around it.
export const getRecentConversationsLegacy: Selector<PmConversationData[]> = createSelector(
  getOwnUser,
  getPrivateMessages,
  getUnreadByPms,
  getUnreadByHuddles,
  getAllUsersById,
  (
    ownUser: User,
    messages: Message[],
    unreadPms: { [number]: number },
    unreadHuddles: { [string]: number },
    allUsersById,
  ): PmConversationData[] => {
    const items = messages
      .map(msg => {
        // Note this can be a different set of users from those in `keyRecipients`.
        const unreadsKey = pmUnreadsKeyFromMessage(msg, ownUser.user_id);
        const keyRecipients = pmKeyRecipientUsersFromMessage(msg, allUsersById, ownUser.user_id);
        return keyRecipients === null ? null : { unreadsKey, keyRecipients, msgId: msg.id };
      })
      .filter(Boolean);

    const latestByRecipients = new Map();
    items.forEach(item => {
      const prev = latestByRecipients.get(item.unreadsKey);
      if (!prev || item.msgId > prev.msgId) {
        latestByRecipients.set(item.unreadsKey, item);
      }
    });

    const sortedByMostRecent = Array.from(latestByRecipients.values()).sort(
      (a, b) => +b.msgId - +a.msgId,
    );

    return sortedByMostRecent.map(conversation => ({
      key: conversation.unreadsKey,
      keyRecipients: conversation.keyRecipients,
      msgId: conversation.msgId,
      unread: unreadCount(conversation.unreadsKey, unreadPms, unreadHuddles),
    }));
  },
);

export const getRecentConversationsModern: Selector<PmConversationData[]> = state =>
  // TODO implement for real
  getRecentConversationsLegacy(state);

const getServerIsOld: Selector<boolean> = createSelector(
  getServerVersion,
  version => !(version && version.isAtLeast(model.MIN_RECENTPMS_SERVER_VERSION)),
);

/**
 * The most recent PM conversations, with unread count and latest message ID.
 */
export const getRecentConversations = (state: GlobalState): PmConversationData[] =>
  getServerIsOld(state) ? getRecentConversationsLegacy(state) : getRecentConversationsModern(state);

export const getUnreadConversations: Selector<PmConversationData[]> = createSelector(
  getRecentConversations,
  conversations => conversations.filter(c => c.unread > 0),
);
