/* @flow strict-local */
import * as logging from '../../utils/logging';
import { chooseUploadImageFilename } from '../ComposeMenu';

describe('chooseUploadImageFilename', () => {
  test('Does nothing if the image uri does not end with an extension for the JPEG format', () => {
    expect(chooseUploadImageFilename('foo', 'foo')).toBe('foo');
  });

  test(
    'Replaces any extension for the HEIC format with an extension for the JPEG format '
      + 'if the file name does end with an extension for the JPEG format',
    () => {
      // suppress `logging.warn` output
      // $FlowFixMe[prop-missing]: Jest mock
      logging.warn.mockReturnValue();

      const fileNameWithoutExtension = 'foo';
      expect(
        chooseUploadImageFilename('some/path/something.jpg', `${fileNameWithoutExtension}.heic`),
      ).toBe(`${fileNameWithoutExtension}.jpeg`);
    },
  );

  test('Replaces prefix from react-native-image-picker', () => {
    expect(
      chooseUploadImageFilename('some/path/something.jpg', 'rn_image_picker_lib_temp_asdf.jpg'),
    ).toBe('asdf.jpg');
  });
});
