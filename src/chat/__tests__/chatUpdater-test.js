import deepFreeze from 'deep-freeze';
import chatUpdater from '../chatUpdater';

describe('chatUpdater', () => {
  test('if message with provided id does not exist, no updates are done', () => {
    const initialState = deepFreeze({
      '[]': [],
    });

    const actualState = chatUpdater(initialState, 1, () => ({ hello: 'world' }));

    expect(actualState).toBe(initialState);
  });

  test('if id exists the message is updated', () => {
    const initialState = deepFreeze({
      '[]': [{ id: 1 }, { id: 2 }],
    });
    const expectedState = {
      '[]': [{ hello: 'world' }, { id: 2 }],
    };

    const actualState = chatUpdater(initialState, 1, prev => ({ hello: 'world' }));

    expect(actualState).toEqual(expectedState);
  });
});
