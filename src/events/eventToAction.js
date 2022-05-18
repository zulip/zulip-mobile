/* @flow strict-local */
import { EventTypes, type EventType, type RealmUserUpdateEventRaw } from '../api/eventTypes';
import * as logging from '../utils/logging';
import type { PerAccountState, EventAction } from '../types';
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
  EVENT_MUTED_TOPICS,
  EVENT_MUTED_USERS,
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
import { getOwnUserId, tryGetUserForId } from '../users/userSelectors';
import { AvatarURL } from '../utils/avatar';
import { getRealmUrl } from '../account/accountsSelectors';
import { messageMoved } from '../api/misc';
import { ensureUnreachable } from '../generics';

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
  subscription: EVENT_SUBSCRIPTION,
  presence: EVENT_PRESENCE,
  muted_topics: EVENT_MUTED_TOPICS,
  muted_users: EVENT_MUTED_USERS,
  realm_emoji: EVENT_REALM_EMOJI_UPDATE,
  realm_filters: EVENT_REALM_FILTERS,
  submessage: EVENT_SUBMESSAGE,
  update_global_notifications: EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
  update_display_settings: EVENT_UPDATE_DISPLAY_SETTINGS,
  user_status: EVENT_USER_STATUS_UPDATE,
};

/**
 * Translate a Zulip event from the server into one of our Redux actions.
 *
 * If the action is one we don't currently handle, return null.
 * If it's one we don't recognize at all, log a warning and return null.
 *
 * For reference on the events in the Zulip API, see:
 *   https://zulip.com/api/get-events
 *
 * This function takes the Redux state as an argument because for a handful
 * of types of events, we have it attach some pieces of the state inside the
 * resulting action.  That is a now-obsolete workaround for letting our
 * Redux sub-reducers use data from elsewhere in the Redux state; don't add
 * new uses.
 *
 * The new approach is that we pass the global Redux state to each
 * sub-reducer, and they should use that instead.  See ef251f48a for
 * discussion, and a2000b9c8 and its parent for an example of using it.
 */
// This FlowFixMe is because this function encodes a large number of
// assumptions about the events the server sends, and doesn't check them.
export default (state: PerAccountState, event: $FlowFixMe): EventAction | null => {
  const type = (event.type: EventType);
  switch (type) {
    // For reference on each type of event, see:
    // https://zulip.com/api/get-events#events

    case 'alert_words':
      return {
        type: EVENT_ALERT_WORDS,
        alert_words: event.alert_words,
      };

    case 'message':
      return {
        type: EVENT_NEW_MESSAGE,
        id: event.id,
        message: {
          ...event.message,
          // Move `flags` key from `event` to `event.message` for
          // consistency; default to empty if `event.flags` is not set.
          flags: event.message.flags ?? event.flags ?? [],
          avatar_url: AvatarURL.fromUserOrBotData({
            rawAvatarUrl: event.message.avatar_url,
            email: event.message.sender_email,
            userId: event.message.sender_id,
            realm: getRealmUrl(state),
          }),
        },
        local_message_id: event.local_message_id,
        caughtUp: state.caughtUp,
        ownUserId: getOwnUserId(state),
      };

    case 'delete_message':
      return {
        type: EVENT_MESSAGE_DELETE,
        // Before server feature level 13 (or if we didn't specify the
        // `bulk_message_deletion` client capability, which we do), this
        // event has `message_id` instead of `message_ids`.
        // TODO(server-3.0): Simplify this.
        messageIds: event.message_ids ?? [event.message_id],
      };

    case 'realm':
      return {
        type: EVENT,
        event:
          /* prettier-ignore */
          event.op === 'update'
            // Convert to an equivalent `update_dict` event, so reducers only have
            //   to handle that one form.
            // TODO: handle `extra_data` hack property in the `update`
            //   event, as long as servers still send it
            ? {
                id: event.id,
                type: EventTypes.realm,
                op: 'update_dict',
                property: 'default',
                data: {
                  [event.property]: event.value,
                },
              }
            : event,
      };

    case 'restart':
    case 'custom_profile_fields':
    case 'stream':
    case 'user_settings':
      return {
        type: EVENT,
        event,
      };

    case 'update_message':
      return {
        type: EVENT_UPDATE_MESSAGE,
        event: { ...event, message_ids: event.message_ids.sort((a, b) => a - b) },
        move: messageMoved(event),
      };

    case 'subscription':
    case 'presence':
    case 'muted_topics':
    case 'muted_users':
    case 'realm_emoji':
    case 'submessage':

    // TODO(server-5.0): Remove these two when all supported servers can
    //   handle the `user_settings_object` client capability (FL 89).
    case 'update_global_notifications': // eslint-disable-line no-fallthrough
    case 'update_display_settings':

    case 'user_status': // eslint-disable-line no-fallthrough
      return {
        ...event,
        type: actionTypeOfEventType[event.type],
      };

    // See notes on `RealmFilter` and `RealmLinkifier` types.
    case 'realm_filters': {
      return {
        ...event,
        type: EVENT_REALM_FILTERS,
        realm_filters: event.realm_filters,
      };
    }

    // See notes on `RealmFilter` and `RealmLinkifier` types.
    //
    // Empirically, servers that know about the new format send two
    // events for every change to the linkifiers: one in this new
    // format and one in the 'realm_filters' format. That's whether we
    // put 'realm_linkifiers' or 'realm_filters' in
    // `fetch_event_types`.
    //
    // Shrug, because we can handle both events, and both events give
    // the whole array of linkifiers, which we're happy to clobber the
    // old state with.
    case 'realm_linkifiers': {
      return {
        ...event,
        type: EVENT_REALM_FILTERS,
        // We do the same in `registerForEvents`'s transform function.
        realm_filters: event.realm_linkifiers.map(({ pattern, url_format, id }) => [
          pattern,
          url_format,
          id,
        ]),
      };
    }

    case 'realm_user': {
      const realm = getRealmUrl(state);

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
          const rawEvent: RealmUserUpdateEventRaw = event;

          const { user_id: userId } = rawEvent.person;
          const existingUser = tryGetUserForId(state, userId);
          if (!existingUser) {
            // If we get one of these events and don't have
            // information on the user, there's nothing to do about
            // it. But it's probably a bug, so, tell Sentry.
            logging.warn(
              "`realm_user` event with op `update` received for a user we don't know about",
              { userId },
            );
            return null;
          }

          const { person } = rawEvent;
          if (person.avatar_url !== undefined) {
            return {
              type: EVENT,
              event: {
                ...rawEvent,
                person: {
                  user_id: person.user_id,
                  avatar_url: AvatarURL.fromUserOrBotData({
                    rawAvatarUrl: person.avatar_url,
                    userId,
                    email: existingUser.email,
                    realm,
                  }),
                },
              },
            };
          } else {
            return {
              type: EVENT,
              event: { ...rawEvent, person },
            };
          }
        }

        case 'remove':
          // TODO: Handle this event and properly form this action.
          return {
            type: EVENT_USER_REMOVE,
          };

        default:
          return null;
      }
    }

    case 'realm_bot':
      // If implementing, don't forget to convert `avatar_url` on
      // `op: 'add'`, and (where `avatar_url` is present) on
      // `op: 'update'`.
      return null;

    case 'reaction':
      return {
        ...event,

        // Raw reaction events from the server have a variation on the
        // properties of `Reaction`: instead of `user_id: UserId`, they have
        // `user: {| email: string, full_name: string, user_id: UserId |}`.
        // NB this is different from the reactions in a `/messages` response;
        // see `getMessages` to compare.
        user_id: event.user.user_id,

        type: opToActionReaction[event.op],
      };

    case 'heartbeat':
      return null;

    case 'update_message_flags':
      return {
        ...event,
        type: EVENT_UPDATE_MESSAGE_FLAGS,

        // Servers with feature level 32+ send `op`. Servers will eventually
        // stop sending `operation`; see #4238.
        // TODO(server-4.0): Simplify to just use `op`.
        op: event.op ?? event.operation,

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

    case 'pointer':
      // Ignore these `pointer` events.  We've never used this information.
      // TODO(server-3.0): The server stopped sending these; drop the case.
      return null;

    case 'hotspots':
      // Ignore these `hotspots` events.  They're about the tutorial
      // experience which is specific to the Zulip web app:
      //   https://zulip.com/api/get-events#hotspots
      return null;

    case 'attachment':
      // Ignore these `attachment` events.  We'd want them in a future
      // where we add a UI that lists the attachments you've uploaded:
      //   https://zulip.com/api/get-events#attachment-add
      return null;

    case 'has_zoom_token':
      // Ignore these `has_zoom_token` events.  We'd want them if
      // supporting creating a Zoom call:
      //   https://zulip.com/api/get-events#has_zoom_token
      return null;

    case 'drafts':
      // Ignore these `drafts` events.  We'll need them as part of #4932,
      // syncing drafts with the server.
      return null;

    case 'default_streams':
    case 'default_stream_groups':
    case 'invites_changed':
    case 'realm_domains':
      // Ignore these event types.  We'll need them as part of #3962 or
      // followup tasks to that, supporting inviting other users to Zulip.
      // We'd also need them as part of a full org-settings UI.
      return null;

    case 'realm_export':
    case 'realm_playgrounds':
    case 'realm_user_settings_defaults':
      // Ignore these event types.  We'll need them eventually as part of a
      // full org-settings UI.
      return null;

    default:
      // Note there are also some event types that are mentioned above
      // (so don't reach this default case), but that at some later stage
      // we don't fully handle: #3408.
      ensureUnreachable(type);
      logging.error(`Unhandled Zulip API event type: ${event.type}`);
      return null;
  }
};
