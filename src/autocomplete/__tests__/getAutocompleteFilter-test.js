import getAutocompleteFilter from '../getAutocompleteFilter';

describe('getAutocompleteFilter', () => {
  test('get False for empty text', () => {
    expect(getAutocompleteFilter('')).toEqual(false);
  });

  test('get @users filters', () => {
    expect(getAutocompleteFilter('@')).toEqual(false);
    expect(getAutocompleteFilter('@ab')).toEqual({ filter: 'ab', lastWordPrefix: '@' });
    expect(getAutocompleteFilter('@ab cd')).toEqual({ filter: 'ab cd', lastWordPrefix: '@' });
  });

  test('get #streams filters', () => {
    expect(getAutocompleteFilter('#')).toEqual(false);
    expect(getAutocompleteFilter('#ab')).toEqual({ filter: 'ab', lastWordPrefix: '#' });
    expect(getAutocompleteFilter('#ab cd')).toEqual({ filter: 'ab cd', lastWordPrefix: '#' });
  });

  test('get :emoji filters', () => {
    expect(getAutocompleteFilter(':')).toEqual(false);
    expect(getAutocompleteFilter(':ab')).toEqual({ filter: 'ab', lastWordPrefix: ':' });
    expect(getAutocompleteFilter(':ab cd')).toEqual({ filter: 'ab cd', lastWordPrefix: ':' });
  });

  test('get filter for more complicated text', () => {
    expect(getAutocompleteFilter(':smile@ab')).toEqual({ filter: 'ab', lastWordPrefix: '@' });
    expect(getAutocompleteFilter(':smile@ab cd')).toEqual({ filter: 'ab cd', lastWordPrefix: '@' });
    expect(getAutocompleteFilter('@ab :cd #a b')).toEqual({ filter: 'a b', lastWordPrefix: '#' });
    expect(getAutocompleteFilter(':#@smile')).toEqual({ filter: 'smile', lastWordPrefix: '@' });
    expect(getAutocompleteFilter('@r@::@q@m p')).toEqual({ filter: 'm p', lastWordPrefix: '@' });
    expect(getAutocompleteFilter('some @ab:cd #a b')).toEqual({
      filter: 'a b',
      lastWordPrefix: '#',
    });
  });
});
