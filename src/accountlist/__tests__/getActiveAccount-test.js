import { fromJS } from 'immutable';
import { getActiveAccount } from '../accountlistSelectors';

it('when no accounts exist, returns undefined', () => {
  const accountlist = fromJS([]);
  const result = getActiveAccount({ accountlist });
  expect(result).toBeUndefined();
});

it('returns first in the list', () => {
  const accountlist = fromJS([{ name: 'account1' }, { name: 'account2' }]);
  const result = getActiveAccount({ accountlist });
  expect(result).toEqual(fromJS({ name: 'account1' }));
});
