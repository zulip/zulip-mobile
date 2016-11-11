import { fromJS } from 'immutable';
import { getActiveAccount } from '../accountSelectors';

test('when no accounts exist, returns undefined', () => {
  const account = fromJS([]);
  const result = getActiveAccount({ account });
  expect(result).toBeUndefined();
});

test('returns first in the list', () => {
  const account = fromJS([{ name: 'account1' }, { name: 'account2' }]);
  const result = getActiveAccount({ account });
  expect(result).toEqual(fromJS({ name: 'account1' }));
});
