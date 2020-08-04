/* @flow strict-local */
import { EventTypes } from '../api/eventTypes';

import * as logging from '../utils/logging';
import type { GlobalState, EventAction } from '../types';
import {
  EVENT_ALERT_WORDS,
  EVENT_NEW_MESSAGE,
  EVENT_PRESENCE,
  EVENT_REACTION_ADD,
  EVENT_REACTION_REMOVE,
  EVENT_TYPING_START,
  EVENT_TYPING_STOP,
  EVENT_SUBMESSAGE,
  EVENT_MESSAGE_DELETE,
  EVENT_UPDATE_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  EVENT_USER_ADD,
  EVENT_USER_REMOVE,
  EVENT_USER_UPDATE,
  EVENT_MUTED_TOPICS,
  EVENT_USER_GROUP_ADD,
  EVENT_USER_GROUP_REMOVE,
  EVENT_USER_GROUP_UPDATE,
  EVENT_USER_GROUP_ADD_MEMBERS,
  EVENT_USER_GROUP_REMOVE_MEMBERS,
  EVENT_USER_STATUS_UPDATE,
  EVENT_REALM_EMOJI_UPDATE,
  EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
  EVENT_UPDATE_DISPLAY_SETTINGS,
  EVENT_REALM_FILTERS,
  EVENT_SUBSCRIPTION,
  EVENT,
} from '../actionConstants';
import { getOwnUser, getOwnUserId, getAllUsersById } from '../users/userSelectors';
import { AvatarURL } from '../utils/avatar';
import { getCurrentRealm } from '../account/accountsSelectors';

const opToActionUserGroup = {
  add: EVENT_USER_GROUP_ADD,
  remove: EVENT_USER_GROUP_REMOVE,
  update: EVENT_USER_GROUP_UPDATE,
  add_members: EVENT_USER_GROUP_ADD_MEMBERS,
  remove_members: EVENT_USER_GROUP_REMOVE_MEMBERS,
};

const opToActionReaction = {
  add: EVENT_REACTION_ADD,
  remove: EVENT_REACTION_REMOVE,
};

const opToActionTyping = {
  start: EVENT_TYPING_START,
  stop: EVENT_TYPING_STOP,
};

const actionTypeOfEventType = {
  update_message: EVENT_UPDATE_MESSAGE,
  subscription: EVENT_SUBSCRIPTION,
  presence: EVENT_PRESENCE,
  muted_topics: EVENT_MUTED_TOPICS,
  realm_emoji: EVENT_REALM_EMOJI_UPDATE,
  realm_filters: EVENT_REALM_FILTERS,
  submessage: EVENT_SUBMESSAGE,
  update_global_notifications: EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
  update_display_settings: EVENT_UPDATE_DISPLAY_SETTINGS,
  user_status: EVENT_USER_STATUS_UPDATE,
};

// This FlowFixMe is because this function encodes a large number of
// assumptions about the events the server sends, and doesn't check them.
export default (state: GlobalState, event: $FlowFixMe): EventAction => {
  switch (event.type) {
    case 'alert_words':
      return {
        type: EVENT_ALERT_WORDS,
        alertWords: event.alert_words,
      };

    case 'message':
      return {
        type: EVENT_NEW_MESSAGE,
        id: event.id,
        message: {
          ...event.message,
          // Move `flags` key from `event` to `event.message` for consistency, and
          // default to an empty array if `event.flags` is not set.
          flags: event.message.flags ?? event.flags ?? [],
          avatar_url: AvatarURL.fromUserOrBotData({
            rawAvatarUrl: event.message.avatar_url,
            email: event.message.sender_email,
            userId: event.message.sender_id,
            realm: getCurrentRealm(state),
          }),
        },
        local_message_id: event.local_message_id,
        caughtUp: state.caughtUp,
        ownUser: getOwnUser(state),
      };

    // Before server feature level 13, or if we don't specify the
    // `bulk_message_deletion` client capability (which we do) this
    // event has `message_id` instead of `message_ids`.
    case 'delete_message':
      return {
        type: EVENT_MESSAGE_DELETE,
        messageIds: event.message_ids ?? [event.message_id],
      };

    case EventTypes.stream:
      return {
        type: EVENT,
        event,
      };

    case 'update_message':
    case 'subscription':
    case 'presence':
    case 'muted_topics':
    case 'realm_emoji':
    case 'realm_filters':
    case 'submessage':
    case 'update_global_notifications':
    case 'update_display_settings':
    case 'user_status':
      return {
        ...event,
        type: actionTypeOfEventType[event.type],
      };

    case 'realm_user': {
      const realm = getCurrentRealm(state);

      switch (event.op) {
        case 'add': {
          const { avatar_url: rawAvatarUrl, user_id: userId, email } = event.person;
          return {
            type: EVENT_USER_ADD,
            id: event.id,
            // TODO: Validate and rebuild `event.person`.
            person: {
              ...event.person,
              avatar_url: AvatarURL.fromUserOrBotData({
                rawAvatarUrl,
                userId,
                email,
                realm,
              }),
            },
          };
        }

        case 'update': {
          const { user_id: userId } = event.person;
          const existingUser = getAllUsersById(state).get(userId);
          if (!existingUser) {
            // If we get one of these events and don't have
            // information on the user, there's nothing to do about
            // it. But it's probably a bug, so, tell Sentry.
            logging.warn(
              "`realm_user` event with op `update` received for a user we don't know about",
              { userId },
            );
            return { type: 'ignore' };
          }

          return {
            type: EVENT_USER_UPDATE,
            id: event.id,
            userId,
            // Just the fields we want to overwrite.
            person: {
              // Note: The `avatar_url` field will be out of sync with
              // some related, documented properties, but we don't
              // currently use them: `avatar_source`,
              // `avatar_url_medium`, and `avatar_version`.
              ...(event.person.avatar_url !== undefined
                ? {
                    avatar_url: AvatarURL.fromUserOrBotData({
                      rawAvatarUrl: event.person.avatar_url,
                      userId,
                      email: existingUser.email,
                      realm,
                    }),
                  }
                : undefined),
            },
          };
        }

        case 'remove':
          // TODO: Handle this event and properly form this action.
          return {
            type: EVENT_USER_REMOVE,
          };

        default:
          return { type: 'ignore' };
      }
    }

    case 'realm_bot':
      // If implementing, don't forget to convert `avatar_url` on
      // `op: 'add'`, and (where `avatar_url` is present) on
      // `op: 'update'`.
      return { type: 'ignore' };

    case 'reaction':
      return {
        ...event,

        // Raw reaction events from the server have a variation on the
        // properties of `Reaction`: instead of `user_id: number`, they have
        // `user: {| email: string, full_name: string, user_id: number |}`.
        // NB this is different from the reactions in a `/messages` response;
        // see `getMessages` to compare.
        user_id: event.user.user_id,

        type: opToActionReaction[event.op],
      };

    case 'heartbeat':
      return { type: 'ignore' };

    case 'update_message_flags':
      return {
        ...event,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        allMessages: state.messages,
      };

    case 'typing':
      return {
        ...event,
        ownUserId: getOwnUserId(state),
        type: opToActionTyping[event.op],
        time: new Date().getTime(),
      };

    case 'user_group':
      return {
        ...event,
        type: opToActionUserGroup[event.op],
      };

    default:
      return { type: 'unknown', event };
  }
};
