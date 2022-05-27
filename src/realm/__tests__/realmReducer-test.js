/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import type { RealmState } from '../../types';
import realmReducer from '../realmReducer';
import {
  ACCOUNT_SWITCH,
  EVENT_REALM_EMOJI_UPDATE,
  EVENT_UPDATE_DISPLAY_SETTINGS,
  EVENT_REALM_FILTERS,
  EVENT,
} from '../../actionConstants';
import type { UserSettings } from '../../api/initialDataTypes';
import type { RealmDataForUpdate } from '../../api/realmDataTypes';
import {
  CreatePublicOrPrivateStreamPolicy,
  CreateWebPublicStreamPolicy,
} from '../../api/permissionsTypes';
import { EventTypes } from '../../api/eventTypes';
import * as eg from '../../__tests__/lib/exampleData';

describe('realmReducer', () => {
  describe('REGISTER_COMPLETE', () => {
    test('updates as appropriate on a boring but representative REGISTER_COMPLETE', () => {
      const action = eg.action.register_complete;
      expect(realmReducer(eg.baseReduxState.realm, action)).toEqual({
        //
        // InitialDataRealm
        //

        name: action.data.realm_name,
        description: action.data.realm_description,
        nonActiveUsers: action.data.realm_non_active_users,
        filters: action.data.realm_filters,
        emoji: {}, // update as necessary if example data changes
        videoChatProvider: null, // update as necessary if example data changes
        mandatoryTopics: action.data.realm_mandatory_topics,
        messageContentDeleteLimitSeconds: action.data.realm_message_content_delete_limit_seconds,
        messageContentEditLimitSeconds: action.data.realm_message_content_edit_limit_seconds,
        pushNotificationsEnabled: action.data.realm_push_notifications_enabled,
        webPublicStreamsEnabled: action.data.server_web_public_streams_enabled,
        createPublicStreamPolicy: action.data.realm_create_public_stream_policy,
        createPrivateStreamPolicy: action.data.realm_create_private_stream_policy,
        createWebPublicStreamPolicy: action.data.realm_create_web_public_stream_policy,
        enableSpectatorAccess: action.data.realm_enable_spectator_access,
        waitingPeriodThreshold: action.data.realm_waiting_period_threshold,

        //
        // InitialDataRealmUser
        //

        canCreateStreams: action.data.can_create_streams,
        isAdmin: action.data.is_admin,
        isOwner: action.data.is_owner,
        isModerator: action.data.is_moderator,
        isGuest: action.data.is_guest,
        user_id: action.data.user_id,
        email: action.data.email,
        crossRealmBots: action.data.cross_realm_bots,

        //
        // InitialDataUserSettings
        //

        /* $FlowIgnore[incompatible-use] - testing modern servers, which
           send user_settings. */
        twentyFourHourTime: action.data.user_settings.twenty_four_hour_time,
      });
    });
  });

  describe('ACCOUNT_SWITCH', () => {
    test('resets state', () => {
      const initialState = eg.plusReduxState.realm;

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
        index: 1,
      });

      const expectedState = eg.baseReduxState.realm;

      const actualState = realmReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_UPDATE_DISPLAY_SETTINGS', () => {
    test('change the display settings', () => {
      const initialState = eg.reduxStatePlus({
        realm: {
          ...eg.plusReduxState.realm,
          twentyFourHourTime: false,
          emoji: {
            customEmoji1: {
              code: 'customEmoji1',
              deactivated: false,
              name: 'Custom Emoji 1',
              source_url: 'https://emoji.zulip.invalid/?id=custom1',
            },
          },
        },
      }).realm;

      const action = deepFreeze({
        type: EVENT_UPDATE_DISPLAY_SETTINGS,
        id: 1,
        setting: true,
        setting_name: 'twenty_four_hour_time',
      });

      const expectedState = {
        ...initialState,
        twentyFourHourTime: true,
      };

      const actualState = realmReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_REALM_EMOJI_UPDATE', () => {
    test('update state to new realm_emoji', () => {
      const initialState = eg.reduxStatePlus({
        realm: {
          ...eg.plusReduxState.realm,
          twentyFourHourTime: false,
          emoji: {},
          filters: [],
        },
      }).realm;

      const action = deepFreeze({
        id: 4,
        realm_emoji: {
          customEmoji1: {
            code: 'customEmoji1',
            deactivated: false,
            name: 'Custom Emoji 1',
            source_url: 'https://emoji.zulip.invalid/?id=custom1',
          },
          customEmoji2: {
            code: 'customEmoji2',
            deactivated: false,
            name: 'Custom Emoji 2',
            source_url: 'https://emoji.zulip.invalid/?id=custom2',
          },
        },
        type: EVENT_REALM_EMOJI_UPDATE,
      });

      const expectedState = {
        ...initialState,
        emoji: {
          customEmoji1: {
            code: 'customEmoji1',
            deactivated: false,
            name: 'Custom Emoji 1',
            source_url: 'https://emoji.zulip.invalid/?id=custom1',
          },
          customEmoji2: {
            code: 'customEmoji2',
            deactivated: false,
            name: 'Custom Emoji 2',
            source_url: 'https://emoji.zulip.invalid/?id=custom2',
          },
        },
      };

      const newState = realmReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_REALM_FILTERS', () => {
    test('update state to new realm_filter', () => {
      const initialState = eg.reduxStatePlus({
        realm: {
          ...eg.plusReduxState.realm,
          twentyFourHourTime: false,
          emoji: {},
          filters: [],
        },
      }).realm;

      const action = deepFreeze({
        id: 4,
        realm_filters: [['#(?P<id>[0-9]+)', 'https://github.com/zulip/zulip/issues/%(id)s', 2]],
        type: EVENT_REALM_FILTERS,
      });

      const expectedState = {
        ...initialState,
        filters: [['#(?P<id>[0-9]+)', 'https://github.com/zulip/zulip/issues/%(id)s', 2]],
      };

      const newState = realmReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT', () => {
    describe('type `user_settings`, op `update`', () => {
      const eventCommon = { id: 0, type: EventTypes.user_settings, op: 'update' };

      const mkCheck = <S: $Keys<RealmState>, E: $Keys<UserSettings>>(
        statePropertyName: S,
        eventPropertyName: E,
      ): (($ElementType<RealmState, S>, $ElementType<UserSettings, E>) => void) => (
        initialStateValue,
        eventValue,
      ) => {
        /* prettier-ignore */ // (wants to wrap the name weirdly)
        test(`${initialStateValue?.toString() ?? '[nullish]'} → ${eventValue?.toString() ?? '[nullish]'}`, () => {
          const initialState = { ...eg.plusReduxState.realm };
          // $FlowFixMe[prop-missing]
          /* $FlowFixMe[incompatible-type]: Trust that the caller passed the
           right kind of value for its chosen key. */
          initialState[statePropertyName] = initialStateValue;

          const expectedState = { ...initialState };
          // $FlowFixMe[prop-missing]
          /* $FlowFixMe[incompatible-type]: Trust that the caller passed the
           right kind of value for its chosen key. */
          expectedState[statePropertyName] = eventValue;

          expect(
            realmReducer(initialState, {
              type: EVENT,
              event: { ...eventCommon, property: eventPropertyName, value: eventValue },
            }),
          ).toEqual(expectedState);
        });
      };

      describe('twentyFourHourTime / twenty_four_hour_time', () => {
        const check = mkCheck('twentyFourHourTime', 'twenty_four_hour_time');
        check(true, true);
        check(true, false);
        check(false, true);
        check(false, false);
      });
    });

    describe('type `realm`, op `update_dict`', () => {
      const eventCommon = { id: 0, type: EventTypes.realm, op: 'update_dict', property: 'default' };

      const mkCheck = <S: $Keys<RealmState>, E: $Keys<RealmDataForUpdate>>(
        statePropertyName: S,
        eventPropertyName: E,
      ): (($ElementType<RealmState, S>, $ElementType<RealmDataForUpdate, E>) => void) => (
        initialStateValue,
        eventValue,
      ) => {
        /* prettier-ignore */ // (wants to wrap the name weirdly)
        test(`${initialStateValue?.toString() ?? '[nullish]'} → ${eventValue?.toString() ?? '[nullish]'}`, () => {
          const initialState = { ...eg.plusReduxState.realm };
          // $FlowFixMe[prop-missing]
          /* $FlowFixMe[incompatible-type]: Trust that the caller passed the
           right kind of value for its chosen key. */
          initialState[statePropertyName] = initialStateValue;

          const expectedState = { ...initialState };
          /* $FlowFixMe[incompatible-type]: Trust that the caller passed the
           right kind of value for its chosen key. */
          expectedState[statePropertyName] = eventValue;

          expect(
            realmReducer(initialState, {
              type: EVENT,
              event: {
                ...eventCommon,
                // $FlowFixMe[invalid-computed-prop]
                data: { [eventPropertyName]: eventValue },
              },
            }),
          ).toEqual(expectedState);
        });
      };

      describe('name / name', () => {
        const check = mkCheck('name', 'name');
        check('foo', 'foo');
        check('foo', 'bar');
      });

      describe('description / description', () => {
        const check = mkCheck('description', 'description');
        check('foo', 'foo');
        check('foo', 'bar');
      });

      describe('enableSpectatorAccess / enable_spectator_access', () => {
        const check = mkCheck('enableSpectatorAccess', 'enable_spectator_access');
        check(true, true);
        check(true, false);
        check(false, true);
        check(false, false);
      });

      describe('createWebPublicStreamPolicy / create_web_public_stream_policy', () => {
        const { AdminOrAbove, ModeratorOrAbove, Nobody, OwnerOnly } = CreateWebPublicStreamPolicy;
        const check = mkCheck('createWebPublicStreamPolicy', 'create_web_public_stream_policy');
        check(AdminOrAbove, ModeratorOrAbove);
        check(AdminOrAbove, Nobody);
        check(AdminOrAbove, OwnerOnly);
        check(ModeratorOrAbove, AdminOrAbove);
        check(ModeratorOrAbove, Nobody);
        check(ModeratorOrAbove, OwnerOnly);
        check(Nobody, AdminOrAbove);
        check(Nobody, ModeratorOrAbove);
        check(Nobody, OwnerOnly);
        check(OwnerOnly, AdminOrAbove);
        check(OwnerOnly, ModeratorOrAbove);
        check(OwnerOnly, Nobody);
      });

      describe('createPublicStreamPolicy / create_public_stream_policy', () => {
        const {
          MemberOrAbove,
          AdminOrAbove,
          FullMemberOrAbove,
          ModeratorOrAbove,
        } = CreatePublicOrPrivateStreamPolicy;
        const check = mkCheck('createPublicStreamPolicy', 'create_public_stream_policy');
        check(MemberOrAbove, AdminOrAbove);
        check(MemberOrAbove, FullMemberOrAbove);
        check(MemberOrAbove, ModeratorOrAbove);
        check(AdminOrAbove, MemberOrAbove);
        check(AdminOrAbove, FullMemberOrAbove);
        check(AdminOrAbove, ModeratorOrAbove);
        check(FullMemberOrAbove, MemberOrAbove);
        check(FullMemberOrAbove, AdminOrAbove);
        check(FullMemberOrAbove, ModeratorOrAbove);
        check(ModeratorOrAbove, MemberOrAbove);
        check(ModeratorOrAbove, AdminOrAbove);
        check(ModeratorOrAbove, FullMemberOrAbove);
      });

      describe('createPrivateStreamPolicy / create_private_stream_policy', () => {
        const {
          MemberOrAbove,
          AdminOrAbove,
          FullMemberOrAbove,
          ModeratorOrAbove,
        } = CreatePublicOrPrivateStreamPolicy;
        const check = mkCheck('createPrivateStreamPolicy', 'create_private_stream_policy');
        check(MemberOrAbove, AdminOrAbove);
        check(MemberOrAbove, FullMemberOrAbove);
        check(MemberOrAbove, ModeratorOrAbove);
        check(AdminOrAbove, MemberOrAbove);
        check(AdminOrAbove, FullMemberOrAbove);
        check(AdminOrAbove, ModeratorOrAbove);
        check(FullMemberOrAbove, MemberOrAbove);
        check(FullMemberOrAbove, AdminOrAbove);
        check(FullMemberOrAbove, ModeratorOrAbove);
        check(ModeratorOrAbove, MemberOrAbove);
        check(ModeratorOrAbove, AdminOrAbove);
        check(ModeratorOrAbove, FullMemberOrAbove);
      });

      describe('create{Private,Public}StreamPolicy / create_stream_policy', () => {
        // TODO(server-5.0): Stop expecting create_stream_policy; remove.

        const {
          MemberOrAbove,
          AdminOrAbove,
          FullMemberOrAbove,
          ModeratorOrAbove,
        } = CreatePublicOrPrivateStreamPolicy;
        const check = (initialStateValue, eventValue) => {
          test(`${initialStateValue.toString()} → ${eventValue.toString()}`, () => {
            const initialState = {
              ...eg.plusReduxState.realm,
              createPublicStreamPolicy: initialStateValue,
              createPrivateStreamPolicy: initialStateValue,
            };

            expect(
              realmReducer(initialState, {
                type: EVENT,
                event: { ...eventCommon, data: { create_stream_policy: eventValue } },
              }),
            ).toEqual({
              ...initialState,
              createPublicStreamPolicy: eventValue,
              createPrivateStreamPolicy: eventValue,
            });
          });
        };

        check(MemberOrAbove, AdminOrAbove);
        check(MemberOrAbove, FullMemberOrAbove);
        check(MemberOrAbove, ModeratorOrAbove);
        check(AdminOrAbove, MemberOrAbove);
        check(AdminOrAbove, FullMemberOrAbove);
        check(AdminOrAbove, ModeratorOrAbove);
        check(FullMemberOrAbove, MemberOrAbove);
        check(FullMemberOrAbove, AdminOrAbove);
        check(FullMemberOrAbove, ModeratorOrAbove);
        check(ModeratorOrAbove, MemberOrAbove);
        check(ModeratorOrAbove, AdminOrAbove);
        check(ModeratorOrAbove, FullMemberOrAbove);
      });

      describe('waitingPeriodThreshold / waiting_period_threshold', () => {
        const check = mkCheck('waitingPeriodThreshold', 'waiting_period_threshold');
        check(90, 90);
        check(90, 30);
      });
    });
  });
});
