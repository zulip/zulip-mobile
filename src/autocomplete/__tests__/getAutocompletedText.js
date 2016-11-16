import getAutocompletedText from '../getAutocompletedText';

describe('getAutocompletedText', () => {
  test('1', () => {
    expect(getAutocompletedText('@ab', 'abcd')).toEqual('@abcd ');
  });

  test('2', () => {
    expect(getAutocompletedText('#ab', 'abcd')).toEqual('#abcd ');
  });

  test('3', () => {
    expect(getAutocompletedText(':ab', 'abcd')).toEqual(':abcd: ');
  });

  test('3', () => {
    expect(getAutocompletedText('word @word @w', 'word')).toEqual('word @word @word ');
  });
});
