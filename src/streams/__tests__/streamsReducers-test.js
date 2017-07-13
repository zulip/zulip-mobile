import streamsReducers from '../streamsReducers';
import {
  ACCOUNT_SWITCH,
  EVENT_STREAM_ADD,
  EVENT_STREAM_REMOVE,
  EVENT_STREAM_UPDATE,
} from '../../actionConstants';

describe('streamsReducers', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = ['some_stream'];
      const action = {
        type: ACCOUNT_SWITCH,
      };
      const expectedState = [];

      const actualState = streamsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_STREAM_ADD', () => {
    test('add new stream', () => {
      const prevState = [];
      const action = {
        type: EVENT_STREAM_ADD,
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
      };
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

      const newState = streamsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if stream already exist, do not add it', () => {
      const prevState = [
        {
          description: 'description',
          stream_id: 1,
          name: 'some stream',
        },
      ];
      const action = {
        type: EVENT_STREAM_ADD,
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
      };
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

      const newState = streamsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_STREAM_REMOVE', () => {
    test('removes stream from state', () => {
      const prevState = [
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
      ];
      const action = {
        type: EVENT_STREAM_REMOVE,
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
      };
      const expectedState = [
        {
          description: 'description',
          stream_id: 3,
          name: 'third stream',
        },
      ];

      const newState = streamsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });

    test('removes streams that exist, do nothing if not', () => {
      const prevState = [
        {
          name: 'some stream',
          stream_id: 1,
        },
      ];
      const action = {
        type: EVENT_STREAM_REMOVE,
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
      };
      const expectedState = [];

      const newState = streamsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_SUBSCRIPTION_UPDATE', () => {
    test('Change the name property', () => {
      const initialState = [
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
      ];
      const action = {
        stream_id: 123,
        type: EVENT_STREAM_UPDATE,
        eventId: 2,
        id: 2,
        name: 'competition',
        op: 'update',
        property: 'name',
        value: 'real competition',
      };
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

      const actualState = streamsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('Change the description property', () => {
      const initialState = [
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
      ];
      const action = {
        stream_id: 53,
        type: EVENT_STREAM_UPDATE,
        eventId: 2,
        id: 2,
        name: 'mobile',
        op: 'update',
        property: 'description',
        value: 'iOS + android',
      };
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

      const actualState = streamsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('Change the email_address property', () => {
      const initialState = [
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
      ];
      const action = {
        stream_id: 123,
        type: EVENT_STREAM_UPDATE,
        eventId: 2,
        id: 2,
        name: 'competition',
        op: 'update',
        property: 'email_address',
        value: '1234@realm.com',
      };
      const expectedState = [
        {
          stream_id: 123,
          name: 'competition',
          email_address: '1234@realm.com',
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

      const actualState = streamsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
