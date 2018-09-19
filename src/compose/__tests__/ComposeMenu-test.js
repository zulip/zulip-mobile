import { fixFileNameFromUri } from '../ComposeMenu';

describe('fixFileNameFromUri', () => {
  test('Does nothing if the image uri does not end with an extension for the JPEG format', () => {
    expect(fixFileNameFromUri('foo', 'foo')).toBe('foo');
  });

  test(
    'Replaces any extension for the HEIC format with an extension for the JPEG format '
      + 'if the file name does end with an extension for the JPEG format',
    () => {
      const fileNameWithoutExtension = 'foo';
      expect(
        fixFileNameFromUri('some/path/something.jpg', `${fileNameWithoutExtension}.heic`),
      ).toBe(`${fileNameWithoutExtension}.jpeg`);
    },
  );
});
