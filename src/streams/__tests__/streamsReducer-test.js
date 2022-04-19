/* @flow strict-local */

import deepFreeze from 'deep-freeze';

import * as eg from '../../__tests__/lib/exampleData';
import { EventTypes } from '../../api/eventTypes';
import { EVENT } from '../../actionConstants';
import streamsReducer from '../streamsReducer';

describe('streamsReducer', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      expect(
        streamsReducer([eg.makeStream({ name: 'some_stream' })], eg.action.account_switch),
      ).toEqual([]);
    });
  });

  describe('EVENT -> stream -> create', () => {
    test('add new stream', () => {
      const stream1 = eg.makeStream({ name: 'some stream', stream_id: 1 });
      const stream2 = eg.makeStream({ name: 'some other stream', stream_id: 2 });

      expect(
        streamsReducer(
          [],
          deepFreeze({
            type: EVENT,
            event: {
              id: 0,
              type: EventTypes.stream,
              op: 'create',
              streams: [stream1, stream2],
            },
          }),
        ),
      ).toEqual([stream1, stream2]);
    });

    test('if stream already exist, do not add it', () => {
      const stream1 = eg.makeStream({
        description: 'description',
        stream_id: 1,
        name: 'some stream',
      });
      const stream2 = eg.makeStream({ name: 'some other stream', stream_id: 2 });

      expect(
        streamsReducer(
          [stream1],
          deepFreeze({
            type: EVENT,
            event: {
              id: 0,
              type: EventTypes.stream,
              op: 'create',
              streams: [stream1, stream2],
            },
          }),
        ),
      ).toEqual([stream1, stream2]);
    });
  });

  describe('EVENT -> stream -> delete', () => {
    test('removes stream from state', () => {
      const stream1 = eg.makeStream({
        description: 'description',
        stream_id: 1,
        name: 'some stream',
      });
      const stream2 = eg.makeStream({
        description: 'description',
        stream_id: 2,
        name: 'other stream',
      });
      const stream3 = eg.makeStream({
        description: 'description',
        stream_id: 3,
        name: 'third stream',
      });

      const newState = streamsReducer(
        [stream1, stream2, stream3],
        deepFreeze({
          type: EVENT,
          event: {
            id: 0,
            type: EventTypes.stream,
            op: 'delete',
            streams: [stream1, stream2],
          },
        }),
      );

      expect(newState).toEqual([stream3]);
    });

    test('removes streams that exist, do nothing if not', () => {
      const stream1 = eg.makeStream({ name: 'some stream', stream_id: 1 });
      const stream2 = eg.makeStream({ name: 'some other stream', stream_id: 2 });

      expect(
        streamsReducer(
          [stream1],
          deepFreeze({
            type: EVENT,
            event: {
              id: 0,
              type: EventTypes.stream,
              op: 'delete',
              streams: [stream1, stream2],
            },
          }),
        ),
      ).toEqual([]);
    });
  });

  describe('EVENT -> stream -> update', () => {
    test('Change the name property', () => {
      const stream123 = eg.makeStream({ stream_id: 123, name: 'competition' });
      const stream67 = eg.makeStream({ stream_id: 67, name: 'design' });
      const stream53 = eg.makeStream({ stream_id: 53, name: 'mobile' });

      expect(
        streamsReducer(
          [stream123, stream67, stream53],
          deepFreeze({
            type: EVENT,
            event: {
              id: 2,
              type: EventTypes.stream,
              op: 'update',
              stream_id: 123,
              name: 'competition',
              property: 'name',
              value: 'real competition',
            },
          }),
        ),
      ).toEqual([{ ...stream123, name: 'real competition' }, stream67, stream53]);
    });

    test('Change the description property', () => {
      const stream123 = eg.makeStream({
        stream_id: 123,
        name: 'competition',
        description: 'slack',
      });
      const stream67 = eg.makeStream({
        stream_id: 67,
        name: 'design',
        description: 'basic design',
      });
      const stream53 = eg.makeStream({ stream_id: 53, name: 'mobile', description: 'android' });

      expect(
        streamsReducer(
          [stream123, stream67, stream53],
          deepFreeze({
            type: EVENT,
            event: {
              id: 2,
              type: EventTypes.stream,
              op: 'update',
              stream_id: 53,
              name: 'mobile',
              property: 'description',
              value: 'iOS + android',
            },
          }),
        ),
      ).toEqual([stream123, stream67, { ...stream53, description: 'iOS + android' }]);
    });
  });
});
