/* @flow strict-local */
import type {
  RealmState,
  PerAccountApplicableAction,
  RealmEmojiById,
  VideoChatProvider,
} from '../types';
import { EventTypes } from '../api/eventTypes';
import {
  REGISTER_COMPLETE,
  EVENT_REALM_EMOJI_UPDATE,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  EVENT,
  EVENT_UPDATE_DISPLAY_SETTINGS,
  EVENT_REALM_FILTERS,
} from '../actionConstants';
import { objectFromEntries } from '../jsBackport';

const initialState = {
  //
  // InitialDataRealm
  //

  name: '',
  description: '',
  nonActiveUsers: [],
  filters: [],
  emoji: {},
  videoChatProvider: null,
  mandatoryTopics: false,
  messageContentDeleteLimitSeconds: null,
  messageContentEditLimitSeconds: 1,
  pushNotificationsEnabled: true,
  webPublicStreamsEnabled: false,
  createWebPublicStreamPolicy: 6,
  enableSpectatorAccess: false,

  //
  // InitialDataRealmUser
  //

  canCreateStreams: true,
  isAdmin: false,
  isOwner: false,
  isModerator: false,
  user_id: undefined,
  email: undefined,
  crossRealmBots: [],

  //
  // InitialDataUserSettings
  //

  twentyFourHourTime: false,
};

const convertRealmEmoji = (data): RealmEmojiById =>
  objectFromEntries(Object.keys(data).map(id => [id, { ...data[id], code: id.toString() }]));

function getVideoChatProvider({
  availableProviders,
  jitsiServerUrl,
  providerId,
}): VideoChatProvider | null {
  // This logic parallels logic in the webapp in static/js/compose.js
  // for interpreting similar data from page_params.
  if (
    availableProviders.jitsi_meet
    && availableProviders.jitsi_meet.id === providerId
    && jitsiServerUrl !== undefined
  ) {
    return { name: 'jitsi_meet', jitsiServerUrl };
  } else {
    return null;
  }
}

export default (
  state: RealmState = initialState,
  action: PerAccountApplicableAction,
): RealmState => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case REGISTER_COMPLETE: {
      return {
        //
        // InitialDataRealm
        //

        name: action.data.realm_name,
        description: action.data.realm_description,
        nonActiveUsers: action.data.realm_non_active_users,
        filters: action.data.realm_filters,
        emoji: convertRealmEmoji(action.data.realm_emoji),
        videoChatProvider: getVideoChatProvider({
          availableProviders: action.data.realm_available_video_chat_providers,
          jitsiServerUrl: action.data.jitsi_server_url,
          providerId: action.data.realm_video_chat_provider,
        }),
        mandatoryTopics: action.data.realm_mandatory_topics,
        messageContentDeleteLimitSeconds: action.data.realm_message_content_delete_limit_seconds,
        messageContentEditLimitSeconds: action.data.realm_message_content_edit_limit_seconds,
        pushNotificationsEnabled: action.data.realm_push_notifications_enabled,
        webPublicStreamsEnabled: action.data.server_web_public_streams_enabled ?? false,
        createWebPublicStreamPolicy: action.data.realm_create_web_public_stream_policy ?? 6,
        enableSpectatorAccess: action.data.realm_enable_spectator_access ?? false,

        //
        // InitialDataRealmUser
        //

        canCreateStreams: action.data.can_create_streams,
        isAdmin: action.data.is_admin,
        isOwner: action.data.is_owner,
        isModerator: action.data.is_moderator ?? action.data.is_admin,
        user_id: action.data.user_id,
        email: action.data.email,
        crossRealmBots: action.data.cross_realm_bots,

        //
        // InitialDataUserSettings
        //

        twentyFourHourTime:
          action.data.user_settings?.twenty_four_hour_time
          // Fall back to InitialDataUpdateDisplaySettings for servers that
          // don't support the user_settings_object client capability.
          /* $FlowIgnore[incompatible-cast]: If `user_settings` is absent,
             this will be present. */
          ?? (action.data.twenty_four_hour_time: boolean),
      };
    }

    // TODO on EVENT_USER_UPDATE for self: update email, isAdmin, etc.

    case EVENT_REALM_FILTERS:
      return {
        ...state,
        filters: action.realm_filters,
      };

    case EVENT_REALM_EMOJI_UPDATE:
      return {
        ...state,
        emoji: convertRealmEmoji(action.realm_emoji),
      };

    case EVENT_UPDATE_DISPLAY_SETTINGS:
      switch (action.setting_name) {
        case 'twenty_four_hour_time':
          return { ...state, twentyFourHourTime: action.setting };
        default:
          return state;
      }

    case EVENT: {
      const { event } = action;
      switch (event.type) {
        case EventTypes.realm:
          if (event.op === 'update_dict') {
            const { data } = event;
            const result = { ...state };

            if (data.name !== undefined) {
              result.name = data.name;
            }
            if (data.description !== undefined) {
              result.description = data.description;
            }
            // TODO: Can also update createWebPublicStreamPolicy?
            //   https://chat.zulip.org/#narrow/stream/412-api-documentation/topic/event.20with.20.60create_web_public_stream_policy.60.3F/near/1381274
            if (data.enable_spectator_access !== undefined) {
              result.enableSpectatorAccess = data.enable_spectator_access;
            }

            return result;
          }

          // (We've converted any `op: 'update'` events to
          //   `op: 'update_dict'` events near the edge.)
          return state;

        case EventTypes.user_settings:
          if (event.op === 'update') {
            const { property, value } = event;
            switch (property) {
              case 'twenty_four_hour_time': {
                // $FlowFixMe[incompatible-cast] - fix UserSettingsUpdateEvent
                return { ...state, twentyFourHourTime: (value: boolean) };
              }

              default:
                return state;
            }
          }

          return state;

        default:
          return state;
      }
    }

    default:
      return state;
  }
};
