/* @flow strict-local */
import { createSelector } from 'reselect';

import type {
  Message,
  PmConversationData,
  PmRecipientUser,
  Selector,
  User,
  UserOrBot,
} from '../types';
import { getPrivateMessages } from '../message/messageSelectors';
import { getOwnUser, getAllUsersById } from '../users/userSelectors';
import { getUnreadByPms, getUnreadByHuddles } from '../unread/unreadSelectors';
import { normalizeRecipientsSansMe, pmUnreadsKeyFromMessage } from '../utils/recipient';

export const getRecentConversations: Selector<PmConversationData[]> = createSelector(
  getOwnUser,
  getPrivateMessages,
  getAllUsersById,
  getUnreadByPms,
  getUnreadByHuddles,
  (
    ownUser: User,
    messages: Message[],
    usersById: Map<number, UserOrBot>,
    unreadPms: { [number]: number },
    unreadHuddles: { [string]: number },
  ): PmConversationData[] => {
    const getUser = (id: number): UserOrBot => {
      const val = usersById.get(id);
      if (val === undefined) {
        throw new Error('getRecentConversations: unknown user ID');
      }
      return val;
    };

    const items = messages.map(msg => ({
      ids: pmUnreadsKeyFromMessage(msg, ownUser.user_id),
      recipients: normalizeRecipientsSansMe(msg.display_recipient, ownUser.email),
      users: (msg.display_recipient: PmRecipientUser[])
        .map(s => getUser(s.id))
        .sort((a, b) => a.user_id - b.user_id),
      msgId: msg.id,
    }));

    const latestByRecipients = new Map();
    items.forEach(item => {
      const prev = latestByRecipients.get(item.recipients);
      if (!prev || item.msgId > prev.msgId) {
        latestByRecipients.set(item.recipients, item);
      }
    });

    const sortedByMostRecent = Array.from(latestByRecipients.values()).sort(
      (a, b) => +b.msgId - +a.msgId,
    );

    return sortedByMostRecent.map(conversation => ({
      msgId: conversation.msgId,
      users: conversation.users,
      unread:
        // This business of looking in one place and then the other is kind
        // of messy.  Fortunately it always works, because the key spaces
        // are disjoint: all `unreadHuddles` keys contain a comma, and all
        // `unreadPms` keys don't.
        /* $FlowFixMe: The keys of unreadPms are logically numbers, but because it's an object they
         end up converted to strings, so this access with string keys works.  We should probably use
         a Map for this and similar maps. */
        unreadPms[conversation.ids] || unreadHuddles[conversation.ids],
    }));
  },
);

export const getUnreadConversations: Selector<PmConversationData[]> = createSelector(
  getRecentConversations,
  conversations => conversations.filter(c => c.unread > 0),
);
