import processMeMessage from '../processMeMessage';

describe('processMeMessage', () => {
  test('empty string is not changed', () => {
    const message = '';
    const result = processMeMessage(message);
    expect(result).toEqual(message);
  });

  test('a simple string is returned as is', () => {
    const message = 'Some message';
    const result = processMeMessage(message);
    expect(result).toEqual(message);
  });

  test('if the string contains a "/me" in <p> tag replace it', () => {
    const message = '<p>/me is happy</p>';
    const result = processMeMessage(message);
    expect(result).toEqual('<span class="message-me">is happy</span>');
  });

  test('no "<p>" tag, no change', () => {
    const message = '/me is happy';
    const result = processMeMessage(message);
    expect(result).toEqual(message);
  });

  test('the "/me" has to come in the first paragraph or else no change', () => {
    const message = '<p>Hey its</p><p>/me Mario</p>';
    const result = processMeMessage(message);
    expect(result).toEqual(message);
  });
});
