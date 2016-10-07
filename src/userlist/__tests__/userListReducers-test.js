import { fromJS } from 'immutable';
import { GET_USER_RESPONSE, PRESENCE_RESPONSE } from '../userListActions';
import userListReducers, { activityFromPresence, timestampFromPresence } from '../userListReducers';

it('when unrecognized action, no previous state, returns initial state, does not throw', () => {
  const newState = userListReducers(undefined, {});
  expect(newState).toBeDefined();
});

it('on unrecognized action, returns input state unchanged', () => {
  const prevState = { hello: 'world' };
  const newState = userListReducers(prevState, {});
  expect(newState).toEqual(prevState);
});

it('on GET_USER_RESPONSE stores user data', () => {
  const users = [{ full_name: 'user1' }, { full_name: 'user2' }];
  const newState = userListReducers(fromJS([]), { type: GET_USER_RESPONSE, users });
  expect(newState.size).toEqual(2);
});

it('activityFromPresence, when single presence, just returns status', () => {
  const activity = activityFromPresence({
    website: {
      status: 'active',
    },
  });
  expect(activity).toEqual('active');
});

it('activityFromPresence, when multiple, the most "active" beats "offline"', () => {
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

it('activityFromPresence, when multiple, the most "idle" beats "offline"', () => {
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

it('timestampFromPresence, when single client just return timestamp', () => {
  const activity = timestampFromPresence({
    website: {
      timestamp: 1475109413,
    },
  });
  expect(activity).toEqual(1475109413);
});

it('timestampFromPresence, when single client just return timestamp', () => {
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

it('PRESENCE_RESPONSE merges a single user in presence response', () => {
  const presence = {
    'some@email.com': {
      website: {
        status: 'active',
        timestamp: 1474527507,
      },
    },
  };
  const prevState = fromJS([{
    full_name: 'Some Guy',
    email: 'some@email.com',
    status: 'offline',
  }]);
  const expectedState = fromJS([{
    full_name: 'Some Guy',
    email: 'some@email.com',
    status: 'active',
    timestamp: 1474527507,
  }]);

  const newState = userListReducers(prevState, { type: PRESENCE_RESPONSE, presence });

  expect(newState).toEqual(expectedState);
});

it('PRESENCE_RESPONSE merges users, skips non existing', () => {
  const presence = {
    'some@email.com': {
      website: {
        status: 'active',
        timestamp: 1474527507,
      },
    },
    'nonexisting@email.com': {
      website: {
        status: 'active',
        timestamp: 1474527507,
      },
    },
  };
  const prevState = fromJS([{
    full_name: 'Some Guy',
    email: 'some@email.com',
    status: 'offline',
  }]);
  const expectedState = fromJS([{
    full_name: 'Some Guy',
    email: 'some@email.com',
    status: 'active',
    timestamp: 1474527507,
  }]);

  const newState = userListReducers(prevState, { type: PRESENCE_RESPONSE, presence });

  expect(newState).toEqual(expectedState);
});

it('PRESENCE_RESPONSE merges multiple users in presence response', () => {
  const presence = {
    'some@email.com': {
      website: {
        status: 'active',
        timestamp: 1474527507,
        client: 'website',
        pushable: false,
      },
    },
    'borisyankov@gmail.com': {
      website: {
        status: 'active',
        timestamp: 1475792187,
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
    'tabbott@zulipchat.com': {
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
    email: 'some@email.com',
    status: 'offline',
  }, {
    full_name: 'Boris Yankov',
    email: 'borisyankov@gmail.com',
    status: 'offline',
  }, {
    full_name: 'Tim Abbott',
    email: 'tabbott@zulipchat.com',
    status: 'offline',
  }]);
  const expectedState = fromJS([{
    full_name: 'Some Guy',
    email: 'some@email.com',
    status: 'active',
    timestamp: 1474527507,
  }, {
    full_name: 'Boris Yankov',
    email: 'borisyankov@gmail.com',
    status: 'active',
    timestamp: 1475792205,
  }, {
    full_name: 'Tim Abbott',
    email: 'tabbott@zulipchat.com',
    status: 'active',
    timestamp: 1475792203,
  }]);

  const newState = userListReducers(prevState, { type: PRESENCE_RESPONSE, presence });

  expect(newState).toEqual(expectedState);
});
