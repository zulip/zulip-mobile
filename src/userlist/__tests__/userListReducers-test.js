import { fromJS } from 'immutable';
import {
  GET_USER_RESPONSE,
  PRESENCE_RESPONSE,
} from '../../constants';
import userListReducers, { activityFromPresence, timestampFromPresence } from '../userListReducers';

test('handles unknown action and no previous state by returning initial state, does not throw', () => {
  const newState = userListReducers(undefined, {});
  expect(newState).toBeDefined();
});

test('on unrecognized action, returns input state unchanged', () => {
  const prevState = { hello: 'world' };
  const newState = userListReducers(prevState, {});
  expect(newState).toEqual(prevState);
});

test('on GET_USER_RESPONSE stores user data', () => {
  const users = [{ full_name: 'user1' }, { full_name: 'user2' }];
  const newState = userListReducers(fromJS([]), { type: GET_USER_RESPONSE, users });
  expect(newState.size).toEqual(2);
});

test('activityFromPresence, when single presence, just returns status', () => {
  const activity = activityFromPresence({
    website: {
      status: 'active',
    },
  });
  expect(activity).toEqual('active');
});

test('activityFromPresence, when multiple, the most "active" beats "offline"', () => {
  const activity = activityFromPresence({
    website: {
      status: 'offline',
    },
    mobile: {
      status: 'active',
    },
  });
  expect(activity).toEqual('active');
});

test('activityFromPresence, when multiple, the most "idle" beats "offline"', () => {
  const activity = activityFromPresence({
    website: {
      status: 'idle',
    },
    mobile: {
      status: 'offline',
    },
  });
  expect(activity).toEqual('idle');
});

test('timestampFromPresence, when single client just return timestamp', () => {
  const activity = timestampFromPresence({
    website: {
      timestamp: 1475109413,
    },
  });
  expect(activity).toEqual(1475109413);
});

test('timestampFromPresence, when single client just return timestamp', () => {
  const activity = timestampFromPresence({
    website: {
      timestamp: 100,
    },
    mobile: {
      timestamp: 200,
    },
  });
  expect(activity).toEqual(200);
});

test('PRESENCE_RESPONSE merges a single user in presence response', () => {
  const fiveSecsAgo = (Math.floor(new Date() - 5) / 1000);
  const presence = {
    'email@example.com': {
      website: {
        status: 'active',
        timestamp: fiveSecsAgo,
      },
    },
  };
  const prevState = fromJS([{
    full_name: 'Some Guy',
    email: 'email@example.com',
    status: 'offline',
  }]);
  const expectedState = fromJS([{
    full_name: 'Some Guy',
    email: 'email@example.com',
    status: 'active',
    timestamp: fiveSecsAgo,
  }]);

  const newState = userListReducers(prevState, { type: PRESENCE_RESPONSE, presence });

  expect(newState).toEqual(expectedState);
});

test('PRESENCE_RESPONSE merges users, skips non existing', () => {
  const fiveSecsAgo = (Math.floor(new Date() - 5) / 1000);
  const presence = {
    'email@example.com': {
      website: {
        status: 'active',
        timestamp: fiveSecsAgo,
      },
    },
    'nonexisting@example.com': {
      website: {
        status: 'active',
        timestamp: fiveSecsAgo,
      },
    },
  };
  const prevState = fromJS([{
    full_name: 'Some Guy',
    email: 'email@example.com',
    status: 'offline',
  }]);
  const expectedState = fromJS([{
    full_name: 'Some Guy',
    email: 'email@example.com',
    status: 'active',
    timestamp: fiveSecsAgo,
  }]);

  const newState = userListReducers(prevState, { type: PRESENCE_RESPONSE, presence });

  expect(newState).toEqual(expectedState);
});

test('PRESENCE_RESPONSE merges multiple users in presence response', () => {
  const fiveSecsAgo = (Math.floor(new Date() - 5) / 1000);
  const presence = {
    'email@example.com': {
      website: {
        status: 'active',
        timestamp: 1474527507,
        client: 'website',
        pushable: false,
      },
    },
    'johndoe@example.com': {
      website: {
        status: 'active',
        timestamp: fiveSecsAgo,
        client: 'website',
        pushable: false,
      },
      ZulipReactNative: {
        status: 'active',
        timestamp: 1475792205,
        client: 'ZulipReactNative',
        pushable: false,
      },
      ZulipAndroid: {
        status: 'active',
        timestamp: 1475455046,
        client: 'ZulipAndroid',
        pushable: false,
      },
    },
    'janedoe@example.com': {
      website: {
        status: 'active',
        timestamp: 1475792203,
        client: 'website',
        pushable: false,
      },
      ZulipAndroid: {
        status: 'active',
        timestamp: 1475109413,
        client: 'ZulipAndroid',
        pushable: false,
      },
    },
  };
  const prevState = fromJS([{
    full_name: 'Some Guy',
    email: 'email@example.com',
    status: 'offline',
  }, {
    full_name: 'John Doe',
    email: 'johndoe@example.com',
    status: 'offline',
  }, {
    full_name: 'Jane Doe',
    email: 'janedoe@example.com',
    status: 'offline',
  }]);
  const expectedState = fromJS([{
    full_name: 'Some Guy',
    email: 'email@example.com',
    status: 'offline',
    timestamp: 1474527507,
  }, {
    full_name: 'John Doe',
    email: 'johndoe@example.com',
    status: 'active',
    timestamp: fiveSecsAgo,
  }, {
    full_name: 'Jane Doe',
    email: 'janedoe@example.com',
    status: 'offline',
    timestamp: 1475792203,
  }]);

  const newState = userListReducers(prevState, { type: PRESENCE_RESPONSE, presence });

  expect(newState).toEqual(expectedState);
});
