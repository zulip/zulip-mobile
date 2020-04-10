/* @flow strict-local */
import { createSelector } from 'reselect';

import type { RecentPrivateConversation, PmConversationData, Selector, User } from '../types';
import { getRecentPrivateConversations } from '../directSelectors';
import { getOwnUser, getAllUsersById } from '../users/userSelectors';
import { getUnreadByPms, getUnreadByHuddles } from '../unread/unreadSelectors';
import { normalizeRecipientsSansMe, sortIds } from '../utils/recipient';

export const getRecentConversations: Selector<PmConversationData[]> = createSelector(
  getRecentPrivateConversations,
  getAllUsersById,
  getOwnUser,
  getUnreadByPms,
  getUnreadByHuddles,
  (
    recentPrivateConversations: RecentPrivateConversation[],
    allUsersById,
    ownUser: User,
    unreadPms: { [number]: number },
    unreadHuddles: { [string]: number },
  ): PmConversationData[] =>
    recentPrivateConversations.map(conversation => {
      const conversationUserIdsIncludeMe = conversation.user_ids.slice();
      if (conversationUserIdsIncludeMe.length !== 1) {
        conversationUserIdsIncludeMe.push(ownUser.user_id);
      }

      const emails = [];
      for (const userId of conversationUserIdsIncludeMe) {
        const user = allUsersById.get(userId);
        if (!user) {
          throw new Error('getRecentConversations: unknown user id');
        }
        emails.push(user.email);
      }

      const userIdsString = sortIds(conversationUserIdsIncludeMe);

      return {
        ids: userIdsString,
        recipients: normalizeRecipientsSansMe(emails.map(email => ({ email })), ownUser.email),
        msgId: conversation.max_message_id,
        unread:
          // This business of looking in one place and then the other is kind
          // of messy.  Fortunately it always works, because the key spaces
          // are disjoint: all `unreadHuddles` keys contain a comma, and all
          // `unreadPms` keys don't.
          /* $FlowFixMe: The keys of unreadPms are logically numbers, but
             because it's an object they end up converted to strings, so
             this access with string keys works.  We should probably use a
             Map for this and similar maps. */
          unreadPms[userIdsString] || unreadHuddles[userIdsString],
      };
    }),
);

export const getUnreadConversations: Selector<PmConversationData[]> = createSelector(
  getRecentConversations,
  conversations => conversations.filter(c => c.unread > 0),
);
