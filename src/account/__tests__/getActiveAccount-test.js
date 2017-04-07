import {getActiveAccount} from '../accountSelectors';

test('when no accounts exist, returns undefined', () => {
  const account = [];
  const result = getActiveAccount({account});
  expect(result).toBeUndefined();
});

test('returns first in the list', () => {
  const account = [{name: 'account1'}, {name: 'account2'}];
  const result = getActiveAccount({account});
  expect(result).toEqual({name: 'account1'});
});
