/* @flow strict-local */
// $FlowFixMe[untyped-import]
import Color from 'color';
import React, { useCallback, useContext, useMemo } from 'react';
import type { Node } from 'react';
import { Platform, View, Alert, Linking, Pressable } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import type { DocumentPickerResponse } from 'react-native-document-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import * as logging from '../utils/logging';
import { TranslationContext } from '../boot/TranslationProvider';
import type { Narrow } from '../types';
import { showErrorAlert } from '../utils/info';
import { createStyleSheet } from '../styles';
import { IconImage, IconCamera, IconAttach, IconVideo } from '../common/Icons';
import { androidEnsureStoragePermission } from '../lightbox/download';
import { ThemeContext } from '../styles/theme';
import type { SpecificIconType } from '../common/Icons';
import { androidSdkVersion } from '../reactNativeUtils';

export type Attachment = {|
  +name: string | null,
  +url: string,
|};

type Props = $ReadOnly<{|
  destinationNarrow: Narrow,
  insertAttachments: ($ReadOnlyArray<Attachment>) => Promise<void>,
  insertVideoCallLink: (() => void) | null,
|}>;

/**
 * Choose an appropriate filename for an image to upload.
 *
 * On Android, at least, react-native-image-picker gives its own wordy
 * prefix to image files from the camera and from the media library. So,
 * remove those.
 *
 * Sometimes we get an image whose filename reflects one format (what it's
 * stored as in the camera roll), but the actual image has been converted
 * already to another format for interoperability.
 *
 * The Zulip server will infer the file format from the filename's
 * extension, so in this case we need to adjust the extension to match the
 * actual format.  The clue we get in the image-picker response is the extension
 * found in `uri`.
 */
export const chooseUploadImageFilename = (uri: string, fileName: string): string => {
  // react-native-image-picker can't currently be configured to use a
  // different prefix on Android:
  //   https://github.com/react-native-image-picker/react-native-image-picker/blob/v4.1.1/android/src/main/java/com/imagepicker/Utils.java#L48
  // So, just trim it out in what we choose to call the file.
  const nameWithoutPrefix = fileName.replace(/^rn_image_picker_lib_temp_/, '');

  /*
   * Photos in an iPhone's camera roll (taken since iOS 11) are typically in
   * HEIF format and have file names with the extension `.HEIC`.  When the user
   * selects one of these photos through the image picker, the file gets
   * automatically converted to JPEG format... but the `fileName` property in
   * the react-native-image-picker response still has the `.HEIC` extension.
   */
  // TODO: Is it still true, after the react-native-image-picker upgrade,
  // that `fileName` can end in .HEIC?
  if (/\.jpe?g$/i.test(uri)) {
    const result = nameWithoutPrefix.replace(/\.heic$/i, '.jpeg');
    if (result !== nameWithoutPrefix) {
      logging.warn('OK, so .HEIC to .jpeg replacement still seems like a good idea.');
    }
    return result;
  }

  return nameWithoutPrefix;
};

// From the doc:
//   https://github.com/react-native-image-picker/react-native-image-picker/tree/v4.10.2#options
// > Only iOS version >= 14 & Android version >= 13 support [multi-select]
//
// Older versions of react-native-image-picker claim to support multi-select
// on older Android versions; we tried that and it gave a bad experience,
// like a generic file picker that wasn't dedicated to handling images well:
//   https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/Android.20select.20multiple.20photos/near/1423109
//
// But multi-select on iOS and on Android 13+ seem to work well.
const kShouldOfferImageMultiselect =
  Platform.OS === 'ios'
  // Android 13
  || androidSdkVersion() >= 33;

type MenuButtonProps = $ReadOnly<{|
  onPress: () => void | Promise<void>,
  IconComponent: SpecificIconType,
|}>;

function MenuButton(props: MenuButtonProps) {
  const { onPress, IconComponent } = props;
  const style = useMemo(() => ({ paddingHorizontal: 12, paddingVertical: 8 }), []);

  const themeData = useContext(ThemeContext);

  // TODO: Use standard colors from a palette; don't do this ad-hoc stuff.
  const color: string = useMemo(
    () => Color(themeData.color).fade(0.5).toString(),
    [themeData.color],
  );
  const pressedColor: string = useMemo(() => Color(color).fade(0.5).toString(), [color]);

  return (
    <Pressable style={style} onPress={onPress}>
      {({ pressed }) => <IconComponent color={pressed ? pressedColor : color} size={24} />}
    </Pressable>
  );
}

export default function ComposeMenu(props: Props): Node {
  const { insertAttachments, insertVideoCallLink } = props;

  const _ = useContext(TranslationContext);

  const handleImagePickerResponse = useCallback(
    response => {
      if (response.didCancel === true) {
        return;
      }

      const errorCode = response.errorCode;
      if (errorCode != null) {
        if (Platform.OS === 'ios' && errorCode === 'permission') {
          // iOS has a quirk where it will only request the native
          // permission-request alert once, the first time the app wants to
          // use a protected resource. After that, the only way the user can
          // grant it is in Settings.
          Alert.alert(
            _('Permissions needed'),
            _('To upload an image, please grant Zulip additional permissions in Settings.'),
            [
              { text: _('Cancel'), style: 'cancel' },
              {
                text: _('Open settings'),
                onPress: () => {
                  Linking.openSettings();
                },
                style: 'default',
              },
            ],
          );
        } else if (errorCode === 'camera_unavailable') {
          showErrorAlert(_('Error'), _('Camera unavailable.'));
        } else {
          const { errorMessage } = response;
          showErrorAlert(_('Error'), errorMessage);
          logging.error('Unexpected error from image picker', {
            errorCode,
            errorMessage: errorMessage ?? '[nullish]',
          });
        }
        return;
      }

      // This will have length one for single-select payloads, or more than
      // one for multi-select. So we'll treat `assets` uniformly: expect it
      // to have length >= 1, and loop over it, even if that means just one
      // iteration.
      const { assets } = response;

      if (!assets || !assets[0]) {
        // TODO: See if we these unexpected situations actually happen. …Ah,
        //   yep, reportedly (and we've seen in Sentry):
        //   https://github.com/react-native-image-picker/react-native-image-picker/issues/1945
        showErrorAlert(_('Error'), _('Failed to attach your file.'));
        logging.error('Image picker response gave falsy `assets` or falsy `assets[0]`', {
          '!assets': !assets,
        });
        return;
      }

      const attachments = [];
      let numMalformed = 0;
      assets.forEach((asset, i) => {
        const { uri, fileName } = asset;

        if (uri == null || fileName == null) {
          // TODO: See if these unexpected situations actually happen.
          logging.error('An asset returned from image picker had nullish `url` and/or `fileName`', {
            'uri == null': uri == null,
            'fileName == null': fileName == null,
            i,
          });
          numMalformed++;
          return;
        }

        attachments.push({ name: chooseUploadImageFilename(uri, fileName), url: uri });
      });

      if (numMalformed > 0) {
        if (assets.length === 1 && numMalformed === 1) {
          showErrorAlert(_('Error'), _('Failed to attach your file.'));
          return;
        } else if (assets.length === numMalformed) {
          showErrorAlert(_('Error'), _('Failed to attach your files.'));
          return;
        } else {
          showErrorAlert(_('Error'), _('Failed to attach some of your files.'));
          // no return; `attachments` will have some items that we can insert
        }
      }

      insertAttachments(attachments);
    },
    [_, insertAttachments],
  );

  const handleImagePicker = useCallback(() => {
    launchImageLibrary(
      {
        // TODO(#3624): Try 'mixed', to allow both photos and videos
        mediaType: 'photo',

        quality: 1.0,
        includeBase64: false,

        // From the doc: "[U]se `0` to allow any number of files"
        //   https://github.com/react-native-image-picker/react-native-image-picker/tree/v4.10.2#options
        //
        // Between single- and multi-select, we expect the payload passed to
        // handleImagePickerResponse to differ only in the length of the
        // `assets` array (one item vs. multiple).
        selectionLimit: kShouldOfferImageMultiselect ? 0 : 1,
      },
      handleImagePickerResponse,
    );
  }, [handleImagePickerResponse]);

  const handleCameraCapture = useCallback(async () => {
    if (Platform.OS === 'android') {
      // On Android ≤9, in order to save the captured photo to storage, we
      // have to put up a scary permission request. We don't have to do that
      // when using "scoped storage", which we do on later Android versions.
      await androidEnsureStoragePermission({
        title: _('Storage permission needed'),
        message: _(
          'Zulip will save a copy of your photo on your device. To do so, Zulip will need permission to store files on your device.',
        ),
      });
    }

    launchCamera(
      {
        mediaType: 'photo',

        // On Android ≤9 (see above) and on iOS, this means putting up a
        // scary permission request. Shrug, because other apps seem to save
        // to storage, and it seems convenient; see
        //   https://chat.zulip.org/#narrow/stream/48-mobile/topic/saving.20photos.20to.20device.20on.20capture/near/1271633.
        // TODO: Still allow capturing and sending the photo, just without
        // saving to storage, if storage permission is denied.
        saveToPhotos: true,

        includeBase64: false,
      },
      handleImagePickerResponse,
    );
  }, [_, handleImagePickerResponse]);

  const handleFilesPicker = useCallback(async () => {
    let response = undefined;
    try {
      response = (await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.allFiles],
      }): $ReadOnlyArray<DocumentPickerResponse>);
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) {
        showErrorAlert(_('Error'), e);
      }
      return;
    }

    insertAttachments(response.map(a => ({ name: a.name, url: a.uri })));
  }, [_, insertAttachments]);

  const styles = useMemo(
    () =>
      createStyleSheet({
        container: {
          flexDirection: 'row',
        },
      }),
    [],
  );

  return (
    <View style={styles.container}>
      <MenuButton onPress={handleFilesPicker} IconComponent={IconAttach} />
      <MenuButton onPress={handleImagePicker} IconComponent={IconImage} />
      <MenuButton onPress={handleCameraCapture} IconComponent={IconCamera} />
      {insertVideoCallLink !== null ? (
        <MenuButton onPress={insertVideoCallLink} IconComponent={IconVideo} />
      ) : null}
    </View>
  );
}
