import getAutocompletedText from '../getAutocompletedText';

describe('getAutocompletedText', () => {
  test('can autocomplete users', () => {
    expect(getAutocompletedText('@ab', 'abcd')).toEqual('@**abcd** ');
  });

  test('can autocomple streams', () => {
    expect(getAutocompletedText('#ab', 'abcd')).toEqual('#**abcd** ');
  });

  test('can autocomplete emojis', () => {
    expect(getAutocompletedText(':ab', 'abcd')).toEqual(':abcd: ');
  });

  test('can autocomplete more complicated text', () => {
    expect(getAutocompletedText('@**word** @w', 'word word')).toEqual(
      '@**word** @**word word** '
    );
  });
});
