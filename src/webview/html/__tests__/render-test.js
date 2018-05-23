import messageTypingAsHtml from '../messageTypingAsHtml';

describe('typing', () => {
  it('escapes values', () => {
    expect(
      messageTypingAsHtml('&<r', [
        {
          avatar_url: '&<av',
          email: '&<e',
        },
      ]),
    ).not.toContain('&<');
  });
});
