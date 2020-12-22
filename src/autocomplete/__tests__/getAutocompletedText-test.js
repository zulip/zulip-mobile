/* @flow strict-local */
import getAutocompletedText from '../getAutocompletedText';

describe('getAutocompletedText', () => {
  let selection = { start: 3, end: 3 };

  test('can autocomplete users', () => {
    expect(getAutocompletedText('@ab', '**abcd**', selection)).toEqual('@**abcd** ');
  });

  test('can autocomplete user groups', () => {
    expect(getAutocompletedText('@ab', '*abcd*', selection)).toEqual('@*abcd* ');
  });

  test('can autocomplete streams', () => {
    expect(getAutocompletedText('#ab', '**abcd**', selection)).toEqual('#**abcd** ');
  });

  test('can autocomplete emojis', () => {
    expect(getAutocompletedText(':ab', 'abcd', selection)).toEqual(':abcd: ');
  });

  test('can autocomplete more complicated text', () => {
    selection = { start: 12, end: 12 };
    expect(getAutocompletedText('@**word** @w', '**word word**', selection)).toEqual(
      '@**word** @**word word** ',
    );

    selection = { start: 2, end: 2 };
    expect(getAutocompletedText(':+', '+1', selection)).toEqual(':+1: ');
  });

  test('get autocompleted text for middle text autocomplete', () => {
    selection = { start: 3, end: 3 };
    expect(getAutocompletedText(':abSome text', 'abcd', selection)).toEqual(':abcd: Some text');
  });
});
