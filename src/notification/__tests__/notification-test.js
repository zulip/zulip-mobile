// @flow strict-local
import deepFreeze from 'deep-freeze';

import type { Notification } from '../types';
import type { UserOrBot } from '../../api/modelTypes';
import type { JSONableDict } from '../../utils/jsonable';
import { getNarrowFromNotificationData } from '..';
import { topicNarrow, pm1to1NarrowFromUser, pmNarrowFromUsersUnsafe } from '../../utils/narrow';

import * as eg from '../../__tests__/lib/exampleData';
import { fromAPNsImpl as extractIosNotificationData } from '../extract';
import objectEntries from '../../utils/objectEntries';

const realm_uri = eg.realm.toString();
const user_id = eg.selfUser.user_id;

describe('getNarrowFromNotificationData', () => {
  const ownUserId = eg.selfUser.user_id;

  test('unknown notification data returns null', () => {
    // $FlowFixMe[incompatible-type]: actually validate APNs messages
    const notification: Notification = {};
    const narrow = getNarrowFromNotificationData(notification, new Map(), ownUserId);
    expect(narrow).toBe(null);
  });

  test('recognizes stream notifications and returns topic narrow', () => {
    const notification = {
      realm_uri,
      recipient_type: 'stream',
      stream_name: 'some stream',
      topic: 'some topic',
    };
    const narrow = getNarrowFromNotificationData(notification, new Map(), ownUserId);
    expect(narrow).toEqual(topicNarrow('some stream', 'some topic'));
  });

  test('on notification for a private message returns a PM narrow', () => {
    const users = [eg.selfUser, eg.otherUser];
    const allUsersByEmail: Map<string, UserOrBot> = new Map(users.map(u => [u.email, u]));
    const notification = {
      realm_uri,
      recipient_type: 'private',
      sender_email: eg.otherUser.email,
    };
    const narrow = getNarrowFromNotificationData(notification, allUsersByEmail, ownUserId);
    expect(narrow).toEqual(pm1to1NarrowFromUser(eg.otherUser));
  });

  test('on notification for a group message returns a group narrow', () => {
    const users = [eg.selfUser, eg.makeUser(), eg.makeUser(), eg.makeUser()];
    const allUsersByEmail: Map<string, UserOrBot> = new Map(users.map(u => [u.email, u]));

    const notification = {
      realm_uri,
      recipient_type: 'private',
      pm_users: users.map(u => u.user_id).join(','),
    };

    const expectedNarrow = pmNarrowFromUsersUnsafe(users.slice(1));

    const narrow = getNarrowFromNotificationData(notification, allUsersByEmail, ownUserId);

    expect(narrow).toEqual(expectedNarrow);
  });
});

describe('extract iOS notification data', () => {
  const barebones = deepFreeze({
    stream: { recipient_type: 'stream', stream: 'announce', topic: 'New channel', realm_uri },
    '1:1 PM': { recipient_type: 'private', sender_email: 'nobody@example.com', realm_uri },
    'group PM': { recipient_type: 'private', pm_users: '54,321', realm_uri },
  });

  describe('success', () => {
    /** Helper function: test data immediately. */
    const verify = (data: JSONableDict) => extractIosNotificationData({ zulip: data });

    for (const [type, data] of objectEntries(barebones)) {
      test(`${type} notification`, () => {
        const expected = (() => {
          const { stream: stream_name = undefined, ...rest } = data;
          return stream_name !== undefined ? { ...rest, stream_name } : data;
        })();

        // barebones 1.9.0-style message is accepted
        const msg = data;
        expect(verify(msg)).toEqual(expected);

        // new(-ish) optional user_id is accepted and copied
        // TODO: Rewrite so modern-style payloads are the baseline, e.g.,
        //   with a `modern` variable instead of `barebones`. Write
        //   individual tests for supporting older-style payloads, and mark
        //   those for future deletion, like with `TODO(1.9.0)`.
        const msg1 = { ...msg, user_id };
        expect(verify(msg1)).toEqual({ ...expected, user_id });

        // unused fields are not copied
        const msg2 = { ...msg, realm_id: 8675309 };
        expect(verify(msg2)).toEqual(expected);

        // unknown fields are ignored and not copied
        const msg2a = { ...msg, unknown_data: ['unknown_data'] };
        expect(verify(msg2a)).toEqual(expected);
      });
    }
  });

  /** Helper function: test raw data after another call. */
  const makeRaw = (data: JSONableDict) => () => extractIosNotificationData(data);
  /** Helper function: test wrapped data after another call. */
  const make = (data: JSONableDict) => () => extractIosNotificationData({ zulip: data });

  describe('failure', () => {
    test('completely malformed or inappropriate messages', () => {
      expect(makeRaw({})).toThrow();
      expect(makeRaw({ message_ids: [1] })).toThrow();
      expect(makeRaw({ initechData: 'everything' })).toThrow(/alien/);
    });

    test('very-old-style messages', () => {
      const sender_email = 'nobody@example.com';
      // baseline
      expect(make({ realm_uri, recipient_type: 'private', sender_email })()).toBeTruthy();
      // missing recipient_type
      expect(make({ realm_uri, sender_email })).toThrow(/archaic/);
      // missing realm_uri
      expect(make({ recipient_type: 'private', sender_email })).toThrow(/archaic/);
    });

    test('broken or partial messages', () => {
      expect(make({ realm_uri, recipient_type: 'huddle' })).toThrow(/invalid/);
      expect(make({ realm_uri, recipient_type: 'stream' })).toThrow(/invalid/);
      expect(make({ realm_uri, recipient_type: 'stream', stream: 'stream name' })).toThrow(
        /invalid/,
      );
      expect(make({ realm_uri, recipient_type: 'stream', subject: 'topic' })).toThrow(/invalid/);
      expect(make({ realm_uri, recipient_type: 'private', subject: 'topic' })).toThrow(/invalid/);
    });

    test('values of incorrect type', () => {
      expect(make({ realm_uri, recipient_type: 'private', pm_users: [1, 2, 3] })).toThrow(
        /invalid/,
      );
      expect(make({ realm_uri, recipient_type: 'stream', stream: [], topic: 'yes' })).toThrow(
        /invalid/,
      );
      expect(
        make({
          realm_uri,
          recipient_type: 'stream',
          stream: { name: 'somewhere' },
          topic: 'no',
        }),
      ).toThrow(/invalid/);
    });

    test('optional data is typechecked', () => {
      expect(
        make({
          ...barebones.stream,
          realm_uri: null,
        }),
      ).toThrow(/invalid/);

      expect(
        make({
          ...barebones['group PM'],
          realm_uri: ['array', 'of', 'string'],
        }),
      ).toThrow(/invalid/);

      expect(
        make({
          ...barebones.stream,
          user_id: 'abc',
        }),
      ).toThrow(/invalid/);
    });

    test('hypothetical future: different event types', () => {
      expect(make({ event: 'remove' })()).toBeUndefined();
      expect(make({ event: 'unknown type' })()).toBeUndefined();
    });
  });
});
