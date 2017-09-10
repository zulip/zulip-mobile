import reducers from '../reducers';

describe('reducers', () => {
  test('reducers return the default states on unknown action', () => {
    expect(() => reducers({}, { type: 'UNKNOWN_ACTION' })).not.toThrow();
  });
});
