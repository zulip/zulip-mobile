/* @flow strict-local */
import getAutocompleteFilter from '../getAutocompleteFilter';

describe('getAutocompleteFilter', () => {
  let selection = { start: 0, end: 0 };
  test('get empty object for empty text', () => {
    expect(getAutocompleteFilter('', selection)).toEqual({ filter: '', lastWordPrefix: '' });
  });

  test('get @users filters', () => {
    selection = { start: 1, end: 1 };
    expect(getAutocompleteFilter('@', selection)).toEqual({ filter: '', lastWordPrefix: '@' });

    selection = { start: 3, end: 3 };
    expect(getAutocompleteFilter('@ab', selection)).toEqual({ filter: 'ab', lastWordPrefix: '@' });

    selection = { start: 6, end: 6 };
    expect(getAutocompleteFilter('@ab cd', selection)).toEqual({
      filter: 'ab cd',
      lastWordPrefix: '@',
    });

    selection = { start: 5, end: 5 };
    expect(getAutocompleteFilter('abc @ ', selection)).toEqual({
      filter: '',
      lastWordPrefix: '@',
    });
  });

  test('get respective lastWordPrefix even when keyword is entered in new line', () => {
    selection = { start: 1, end: 1 };
    expect(getAutocompleteFilter('\n@', selection)).toEqual({ filter: '', lastWordPrefix: '' });
    expect(getAutocompleteFilter('\n#', selection)).toEqual({ filter: '', lastWordPrefix: '' });
    expect(getAutocompleteFilter('\n:', selection)).toEqual({ filter: '', lastWordPrefix: '' });

    selection = { start: 2, end: 2 };
    expect(getAutocompleteFilter('\n@', selection)).toEqual({ filter: '', lastWordPrefix: '@' });
    expect(getAutocompleteFilter('\n#', selection)).toEqual({ filter: '', lastWordPrefix: '#' });
    expect(getAutocompleteFilter('\n:', selection)).toEqual({ filter: '', lastWordPrefix: ':' });
  });

  test('get #streams filters', () => {
    selection = { start: 1, end: 1 };
    expect(getAutocompleteFilter('#', selection)).toEqual({ filter: '', lastWordPrefix: '#' });

    selection = { start: 3, end: 3 };
    expect(getAutocompleteFilter('#ab', selection)).toEqual({ filter: 'ab', lastWordPrefix: '#' });

    selection = { start: 6, end: 6 };
    expect(getAutocompleteFilter('#ab cd', selection)).toEqual({
      filter: 'ab cd',
      lastWordPrefix: '#',
    });

    selection = { start: 5, end: 5 };
    expect(getAutocompleteFilter('abc # ', selection)).toEqual({
      filter: '',
      lastWordPrefix: '#',
    });
  });

  test('get :emoji filters', () => {
    selection = { start: 1, end: 1 };
    expect(getAutocompleteFilter(':', selection)).toEqual({ filter: '', lastWordPrefix: ':' });

    selection = { start: 3, end: 3 };
    expect(getAutocompleteFilter(':ab', selection)).toEqual({ filter: 'ab', lastWordPrefix: ':' });

    selection = { start: 6, end: 6 };
    expect(getAutocompleteFilter(':ab cd', selection)).toEqual({
      filter: 'ab cd',
      lastWordPrefix: ':',
    });

    selection = { start: 5, end: 5 };
    expect(getAutocompleteFilter('abc : ', selection)).toEqual({
      filter: '',
      lastWordPrefix: ':',
    });
  });

  test('get filter for more complicated text', () => {
    selection = { start: 9, end: 9 };
    expect(getAutocompleteFilter(':smile@ab', selection)).toEqual({
      filter: 'smile@ab',
      lastWordPrefix: ':',
    });

    selection = { start: 2, end: 2 };
    expect(getAutocompleteFilter(':s@ab', selection)).toEqual({ filter: 's', lastWordPrefix: ':' });

    selection = { start: 12, end: 12 };
    expect(getAutocompleteFilter(':smile@ab cd', selection)).toEqual({
      filter: 'smile@ab cd',
      lastWordPrefix: ':',
    });

    selection = { start: 3, end: 3 };
    expect(getAutocompleteFilter('@ab :cd #a b', selection)).toEqual({
      filter: 'ab',
      lastWordPrefix: '@',
    });

    selection = { start: 7, end: 7 };
    expect(getAutocompleteFilter('@ab :cd #a b', selection)).toEqual({
      filter: 'cd',
      lastWordPrefix: ':',
    });

    selection = { start: 12, end: 12 };
    expect(getAutocompleteFilter('@ab :cd #a b', selection)).toEqual({
      filter: 'a b',
      lastWordPrefix: '#',
    });

    selection = { start: 8, end: 8 };
    expect(getAutocompleteFilter(':#@smile', selection)).toEqual({
      filter: 'smile',
      lastWordPrefix: '@',
    });

    selection = { start: 1, end: 1 };
    expect(getAutocompleteFilter(':#@smile', selection)).toEqual({
      filter: '',
      lastWordPrefix: ':',
    });

    selection = { start: 11, end: 11 };
    expect(getAutocompleteFilter('@r@::@q@m p', selection)).toEqual({
      filter: '@q@m p',
      lastWordPrefix: ':',
    });

    selection = { start: 1, end: 1 };
    expect(getAutocompleteFilter('@r@::@q@m p', selection)).toEqual({
      filter: '',
      lastWordPrefix: '@',
    });

    selection = { start: 16, end: 16 };
    expect(getAutocompleteFilter('some @ab:cd #a b', selection)).toEqual({
      filter: 'a b',
      lastWordPrefix: '#',
    });
  });
});
