import deepFreeze from 'deep-freeze';

import { EventTypes } from '../../api/eventTypes';
import { ACCOUNT_SWITCH, EVENT } from '../../actionConstants';
import streamsReducer from '../streamsReducer';

describe('streamsReducer', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = deepFreeze(['some_stream']);

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
      });

      const expectedState = [];

      const actualState = streamsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT -> stream -> create', () => {
    test('add new stream', () => {
      const initialState = deepFreeze([]);

      const action = deepFreeze({
        type: EVENT,
        event: {
          type: EventTypes.stream,
          op: 'create',
          streams: [
            {
              name: 'some stream',
              stream_id: 1,
            },
            {
              name: 'some other stream',
              stream_id: 2,
            },
          ],
        },
      });

      const expectedState = [
        {
          name: 'some stream',
          stream_id: 1,
        },
        {
          name: 'some other stream',
          stream_id: 2,
        },
      ];

      const newState = streamsReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if stream already exist, do not add it', () => {
      const initialState = deepFreeze([
        {
          description: 'description',
          stream_id: 1,
          name: 'some stream',
        },
      ]);

      const action = deepFreeze({
        type: EVENT,
        event: {
          type: EventTypes.stream,
          op: 'create',
          streams: [
            {
              description: 'description',
              name: 'some stream',
              stream_id: 1,
            },
            {
              name: 'some other stream',
              stream_id: 2,
            },
          ],
        },
      });

      const expectedState = [
        {
          description: 'description',
          name: 'some stream',
          stream_id: 1,
        },
        {
          name: 'some other stream',
          stream_id: 2,
        },
      ];

      const newState = streamsReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT -> stream -> delete', () => {
    test('removes stream from state', () => {
      const initialState = deepFreeze([
        {
          description: 'description',
          stream_id: 1,
          name: 'some stream',
        },
        {
          description: 'description',
          stream_id: 2,
          name: 'other stream',
        },
        {
          description: 'description',
          stream_id: 3,
          name: 'third stream',
        },
      ]);

      const action = deepFreeze({
        type: EVENT,
        event: {
          type: EventTypes.stream,
          op: 'delete',
          streams: [
            {
              name: 'some stream',
              stream_id: 1,
            },
            {
              name: 'some other stream',
              stream_id: 2,
            },
          ],
        },
      });

      const expectedState = [
        {
          description: 'description',
          stream_id: 3,
          name: 'third stream',
        },
      ];

      const newState = streamsReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('removes streams that exist, do nothing if not', () => {
      const initialState = deepFreeze([
        {
          name: 'some stream',
          stream_id: 1,
        },
      ]);

      const action = deepFreeze({
        type: EVENT,
        event: {
          type: EventTypes.stream,
          op: 'delete',
          streams: [
            {
              name: 'some stream',
              stream_id: 1,
            },
            {
              name: 'some other stream',
              stream_id: 2,
            },
          ],
        },
      });

      const expectedState = [];

      const newState = streamsReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT -> stream -> update', () => {
    test('Change the name property', () => {
      const initialState = deepFreeze([
        {
          stream_id: 123,
          name: 'competition',
          email_address: '123@realm.com',
        },
        {
          stream_id: 67,
          name: 'design',
          email_address: '67@realm.com',
        },
        {
          stream_id: 53,
          name: 'mobile',
          email_address: '53@realm.com',
        },
      ]);

      const action = deepFreeze({
        type: EVENT,
        event: {
          type: EventTypes.stream,
          stream_id: 123,
          op: 'update',
          eventId: 2,
          id: 2,
          name: 'competition',
          property: 'name',
          value: 'real competition',
        },
      });

      const expectedState = [
        {
          stream_id: 123,
          name: 'real competition',
          email_address: '123@realm.com',
        },
        {
          stream_id: 67,
          name: 'design',
          email_address: '67@realm.com',
        },
        {
          stream_id: 53,
          name: 'mobile',
          email_address: '53@realm.com',
        },
      ];

      const actualState = streamsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('Change the description property', () => {
      const initialState = deepFreeze([
        {
          stream_id: 123,
          name: 'competition',
          email_address: '123@realm.com',
          description: 'slack',
        },
        {
          stream_id: 67,
          name: 'design',
          email_address: '67@realm.com',
          description: 'basic design',
        },
        {
          stream_id: 53,
          name: 'mobile',
          email_address: '53@realm.com',
          description: 'android',
        },
      ]);

      const action = deepFreeze({
        type: EVENT,
        event: {
          type: EventTypes.stream,
          stream_id: 53,
          op: 'update',
          eventId: 2,
          id: 2,
          name: 'mobile',
          property: 'description',
          value: 'iOS + android',
        },
      });

      const expectedState = [
        {
          stream_id: 123,
          name: 'competition',
          email_address: '123@realm.com',
          description: 'slack',
        },
        {
          stream_id: 67,
          name: 'design',
          email_address: '67@realm.com',
          description: 'basic design',
        },
        {
          stream_id: 53,
          name: 'mobile',
          email_address: '53@realm.com',
          description: 'iOS + android',
        },
      ];

      const actualState = streamsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
