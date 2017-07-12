import chatUpdater from '../chatUpdater';

describe('chatUpdater', () => {
  test('if message with provided id does not exist, no updates are done', () => {
    const initialState = {
      messages: {
        '[]': [],
      },
    };

    const actualState = chatUpdater(initialState, 1, () => ({ hello: 'world' }));

    expect(actualState).toEqual(initialState);
  });

  test('if id exists the message is updated', () => {
    const initialState = {
      messages: {
        '[]': [{ id: 1 }, { id: 2 }],
      },
    };
    const expectedState = {
      messages: {
        '[]': [{ hello: 'world' }, { id: 2 }],
      },
    };

    const actualState = chatUpdater(initialState, 1, prev => ({ hello: 'world' }));

    expect(actualState).toEqual(expectedState);
  });
});
