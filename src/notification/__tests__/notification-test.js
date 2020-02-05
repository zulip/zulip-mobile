// @flow strict-local
import deepFreeze from 'deep-freeze';

import type { User } from '../../api/modelTypes';
import type { JSONableDict } from '../../utils/jsonable';
import { getNarrowFromNotificationData } from '..';
import { topicNarrow, pmNarrowFromEmail, pmNarrowFromEmails } from '../../utils/narrow';

import * as eg from '../../__tests__/lib/exampleData';
import { fromAPNsImpl as extractIosNotificationData } from '../extract';
import objectEntries from '../../utils/objectEntries';

describe('getNarrowFromNotificationData', () => {
  const DEFAULT_MAP = new Map<number, User>();
  const ownUserId = eg.selfUser.user_id;

  test('unknown notification data returns null', () => {
    // $FlowFixMe: actually validate APNs messages
    const notification: Notification = {};
    const narrow = getNarrowFromNotificationData(notification, DEFAULT_MAP, ownUserId);
    expect(narrow).toBe(null);
  });

  test('recognizes stream notifications and returns topic narrow', () => {
    const notification = {
      recipient_type: 'stream',
      stream: 'some stream',
      topic: 'some topic',
    };
    const narrow = getNarrowFromNotificationData(notification, DEFAULT_MAP, ownUserId);
    expect(narrow).toEqual(topicNarrow('some stream', 'some topic'));
  });

  test('on notification for a private message returns a PM narrow', () => {
    const notification = {
      recipient_type: 'private',
      sender_email: 'mark@example.com',
    };
    const narrow = getNarrowFromNotificationData(notification, DEFAULT_MAP, ownUserId);
    expect(narrow).toEqual(pmNarrowFromEmail('mark@example.com'));
  });

  test('on notification for a group message returns a group narrow', () => {
    const users = [eg.selfUser, eg.makeUser(), eg.makeUser(), eg.makeUser()];
    const usersById: Map<number, User> = new Map(users.map(u => [u.user_id, u]));

    const notification = {
      recipient_type: 'private',
      pm_users: users.map(u => u.user_id).join(','),
    };

    const expectedNarrow = pmNarrowFromEmails(users.slice(1).map(u => u.email));

    const narrow = getNarrowFromNotificationData(notification, usersById, ownUserId);

    expect(narrow).toEqual(expectedNarrow);
  });

  test('do not throw when users are not found; return null', () => {
    const notification = {
      recipient_type: 'private',
      pm_users: '1,2,4',
    };
    const usersById = new Map();

    const narrow = getNarrowFromNotificationData(notification, usersById, ownUserId);

    expect(narrow).toBe(null);
  });
});

describe('extract iOS notification data', () => {
  const barebones = deepFreeze({
    stream: { recipient_type: 'stream', stream: 'announce', topic: 'New channel' },
    private: {
      recipient_type: 'private',
      sender_email: 'nobody@example.com',
    },
    'group PM': {
      recipient_type: 'private',
      sender_email: 'nobody@example.com',
    },
  });

  describe('success', () => {
    /** Helper function: test data immediately. */
    const verify = (data: JSONableDict) => extractIosNotificationData({ zulip: data });

    for (const [type, data] of objectEntries(barebones)) {
      test(`${type} notification`, () => {
        // barebones 1.8.0-style message is accepted
        const msg = data;
        expect(verify(msg)).toEqual(msg);

        // unused fields are not copied
        const msg2 = { ...msg, realm_id: 8675309 };
        expect(verify(msg2)).toEqual(msg);

        // unknown fields are ignored and not copied
        const msg2a = { ...msg, unknown_data: ['unknown_data'] };
        expect(verify(msg2a)).toEqual(msg);

        // realm_uri is copied if present
        const msg3 = { ...msg, realm_uri: 'https://zulip.example.org' };
        expect(verify(msg3)).toEqual(msg3);
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
      expect(make({ message_ids: [123] })).toThrow(/archaic/);
    });

    test('broken or partial messages', () => {
      expect(make({ recipient_type: 'huddle' })).toThrow(/invalid/);
      expect(make({ recipient_type: 'stream' })).toThrow(/invalid/);
      expect(make({ recipient_type: 'stream', stream: 'stream name' })).toThrow(/invalid/);
      expect(make({ recipient_type: 'stream', subject: 'topic' })).toThrow(/invalid/);
      expect(make({ recipient_type: 'private', subject: 'topic' })).toThrow(/invalid/);
    });

    test('values of incorrect type', () => {
      expect(make({ recipient_type: 'private', pm_users: [1, 2, 3] })).toThrow(/invalid/);
      expect(make({ recipient_type: 'stream', stream: [], topic: 'yes' })).toThrow(/invalid/);
      expect(
        make({
          recipient_type: 'stream',
          stream: { name: 'somewhere' },
          topic: 'no',
        }),
      ).toThrow(/invalid/);
    });

    test('optional data is typechecked', () => {
      expect(
        make({
          realm_uri: null,
          ...barebones.stream,
        }),
      ).toThrow(/invalid/);

      expect(
        make({
          realm_uri: ['array', 'of', 'string'],
          ...barebones['group PM'],
        }),
      ).toThrow(/invalid/);
    });

    test('hypothetical future: different event types', () => {
      expect(make({ event: 'remove' })()).toBeUndefined();
      expect(make({ event: 'unknown type' })()).toBeUndefined();
    });
  });
});
