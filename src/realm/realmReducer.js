/* @flow strict-local */
import type { RealmState, Action, RealmEmojiById, VideoChatProvider } from '../types';
import {
  REGISTER_COMPLETE,
  EVENT_REALM_EMOJI_UPDATE,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  EVENT_UPDATE_DISPLAY_SETTINGS,
  EVENT_REALM_FILTERS,
} from '../actionConstants';
import { objectFromEntries } from '../jsBackport';

const initialState = {
  crossRealmBots: [],

  nonActiveUsers: [],
  filters: [],
  emoji: {},
  videoChatProvider: null,
  mandatoryTopics: false,

  email: undefined,
  user_id: undefined,
  twentyFourHourTime: false,
  canCreateStreams: true,
  isAdmin: false,
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

export default (state: RealmState = initialState, action: Action): RealmState => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case REGISTER_COMPLETE: {
      return {
        crossRealmBots: action.data.cross_realm_bots,

        nonActiveUsers: action.data.realm_non_active_users,
        filters: action.data.realm_filters,
        emoji: convertRealmEmoji(action.data.realm_emoji),
        videoChatProvider: getVideoChatProvider({
          availableProviders: action.data.realm_available_video_chat_providers,
          jitsiServerUrl: action.data.jitsi_server_url,
          providerId: action.data.realm_video_chat_provider,
        }),
        mandatoryTopics: action.data.realm_mandatory_topics,

        email: action.data.email,
        user_id: action.data.user_id,
        twentyFourHourTime: action.data.twenty_four_hour_time,
        canCreateStreams: action.data.can_create_streams,
        isAdmin: action.data.is_admin,
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

    default:
      return state;
  }
};
