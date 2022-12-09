/* @flow strict-local */

import deepFreeze from 'deep-freeze';

import * as eg from '../../__tests__/lib/exampleData';
import { EventTypes, type StreamEvent } from '../../api/eventTypes';
import { EVENT } from '../../actionConstants';
import streamsReducer from '../streamsReducer';

const mkAction = <E: $Diff<StreamEvent, {| id: mixed, type: mixed |}>>(event: E) =>
  deepFreeze({ type: EVENT, event: { id: 0, type: EventTypes.stream, ...event } });

describe('streamsReducer', () => {
  describe('RESET_ACCOUNT_DATA', () => {
    test('resets state to initial state', () => {
      expect(
        streamsReducer([eg.makeStream({ name: 'some_stream' })], eg.action.reset_account_data),
      ).toEqual([]);
    });
  });

  describe('EVENT -> stream -> create', () => {
    test('add new stream', () => {
      const stream1 = eg.makeStream({ name: 'some stream', stream_id: 1 });
      const stream2 = eg.makeStream({ name: 'some other stream', stream_id: 2 });

      const action = mkAction({ op: 'create', streams: [stream1, stream2] });
      expect(streamsReducer([], action)).toEqual([stream1, stream2]);
    });

    test('if stream already exist, do not add it', () => {
      const stream1 = eg.makeStream({
        description: 'description',
        stream_id: 1,
        name: 'some stream',
      });
      const stream2 = eg.makeStream({ name: 'some other stream', stream_id: 2 });

      const action = mkAction({ op: 'create', streams: [stream1, stream2] });
      expect(streamsReducer([stream1], action)).toEqual([stream1, stream2]);
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

      const action = mkAction({ op: 'delete', streams: [stream1, stream2] });
      const newState = streamsReducer([stream1, stream2, stream3], action);

      expect(newState).toEqual([stream3]);
    });

    test('removes streams that exist, do nothing if not', () => {
      const stream1 = eg.makeStream({ name: 'some stream', stream_id: 1 });
      const stream2 = eg.makeStream({ name: 'some other stream', stream_id: 2 });

      const action = mkAction({ op: 'delete', streams: [stream1, stream2] });
      expect(streamsReducer([stream1], action)).toEqual([]);
    });
  });

  describe('EVENT -> stream -> update', () => {
    test('Change the name property', () => {
      const stream123 = eg.makeStream({ stream_id: 123, name: 'competition' });
      const stream67 = eg.makeStream({ stream_id: 67, name: 'design' });
      const stream53 = eg.makeStream({ stream_id: 53, name: 'mobile' });

      const action = mkAction({
        op: 'update',
        stream_id: 123,
        name: 'competition',
        property: 'name',
        value: 'real competition',
      });
      expect(streamsReducer([stream123, stream67, stream53], action)).toEqual([
        { ...stream123, name: 'real competition' },
        stream67,
        stream53,
      ]);
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

      const action = mkAction({
        op: 'update',
        stream_id: 53,
        name: 'mobile',
        property: 'description',
        value: 'iOS + android',
        rendered_description: '<p>iOS + android</p>',
      });
      expect(streamsReducer([stream123, stream67, stream53], action)).toEqual([
        stream123,
        stream67,
        { ...stream53, description: 'iOS + android', rendered_description: '<p>iOS + android</p>' },
      ]);
    });

    test('Change the invite_only property', () => {
      const stream1 = eg.makeStream({
        stream_id: 1,
        name: 'web public stream',
        invite_only: false,
        is_web_public: true,
        history_public_to_subscribers: true,
      });
      const stream2 = eg.makeStream({
        stream_id: 2,
        name: 'invite only stream',
        invite_only: true,
        is_web_public: false,
        history_public_to_subscribers: true,
      });

      const action = mkAction({
        op: 'update',
        stream_id: stream1.stream_id,
        name: stream1.name,
        property: 'invite_only',
        value: true,
        is_web_public: false,
        history_public_to_subscribers: false,
      });
      expect(streamsReducer([stream1, stream2], action)).toEqual([
        {
          ...stream1,
          invite_only: true,
          is_web_public: false,
          history_public_to_subscribers: false,
        },
        stream2,
      ]);
    });
  });
});
