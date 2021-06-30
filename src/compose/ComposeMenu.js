/* @flow strict-local */
import React, { useCallback } from 'react';
import { Platform, View } from 'react-native';
import type { DocumentPickerResponse } from 'react-native-document-picker';
import ImagePicker from 'react-native-image-picker';

import type { Narrow } from '../types';
import { useDispatch } from '../react-redux';
import { showErrorAlert } from '../utils/info';
import { BRAND_COLOR, createStyleSheet } from '../styles';
import {
  IconPlusCircle,
  IconLeft,
  IconImage,
  IconCamera,
  IconFile,
  IconVideo,
} from '../common/Icons';
import AnimatedComponent from '../animation/AnimatedComponent';
import { uploadFile } from '../actions';

type Props = $ReadOnly<{|
  expanded: boolean,
  destinationNarrow: Narrow,
  insertVideoCallLink: (() => void) | null,
  onExpandContract: () => void,
|}>;

/**
 * Adjust `fileName` to one with the right extension for the file format.
 *
 * Sometimes we get an image whose filename reflects one format (what it's
 * stored as in the camera roll), but the actual image has been converted
 * already to another format for interoperability.
 *
 * The Zulip server will infer the file format from the filename's
 * extension, so in this case we need to adjust the extension to match the
 * actual format.  The clue we get in the image-picker response is the extension
 * found in `uri`.
 *
 * Also if `fileName` is null or undefined, default to the last component of `uri`.
 */
export const chooseUploadImageFilename = (uri: string, fileName: ?string): string => {
  const name = fileName ?? uri.replace(/.*\//, '');

  /*
   * Photos in an iPhone's camera roll (taken since iOS 11) are typically in
   * HEIF format and have file names with the extension `.HEIC`.  When the user
   * selects one of these photos through the image picker, the file gets
   * automatically converted to JPEG format... but the `fileName` property in
   * the react-native-image-picker response still has the `.HEIC` extension.
   */
  if (/\.jpe?g$/i.test(uri)) {
    return name.replace(/\.heic$/i, '.jpeg');
  }

  return name;
};

export default function ComposeMenu(props: Props) {
  const { destinationNarrow } = props;
  const dispatch = useDispatch();

  const uploadFileCallback = useCallback(
    (uri: string, fileName: ?string) => {
      dispatch(uploadFile(destinationNarrow, uri, chooseUploadImageFilename(uri, fileName)));
    },
    [dispatch, destinationNarrow],
  );

  const handleImagePickerResponse = (
    response: $ReadOnly<{
      didCancel: boolean,
      // Upstream docs are vague:
      // https://github.com/react-native-community/react-native-image-picker/blob/master/docs/Reference.md
      error?: string | void | null | false,
      uri: string,
      // Upstream docs are wrong (fileName may indeed be null, at least on iOS);
      // surfaced in https://github.com/zulip/zulip-mobile/issues/3813:
      // https://github.com/react-native-community/react-native-image-picker/issues/1271
      fileName: ?string,
      ...
    }>,
  ) => {
    if (response.didCancel) {
      return;
    }

    // $FlowFixMe[sketchy-null-string]
    /* $FlowFixMe[sketchy-null-bool]
       Upstream API is unclear. */
    const error: string | null = response.error || null;
    if (error !== null) {
      showErrorAlert('Error', error);
      return;
    }

    uploadFileCallback(response.uri, response.fileName);
  };

  const handleImagePicker = () => {
    ImagePicker.launchImageLibrary(
      {
        quality: 1.0,
        noData: true,
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
      },
      handleImagePickerResponse,
    );
  };

  const handleCameraCapture = () => {
    const options = {
      storageOptions: {
        cameraRoll: true,
        waitUntilSaved: true,
      },
    };

    ImagePicker.launchCamera(options, handleImagePickerResponse);
  };

  const handleFilePicker = async () => {
    // Defer import to here, to avoid an obnoxious import-time warning
    // from this library when in the test environment.
    const DocumentPicker = (await import('react-native-document-picker')).default;

    let response = undefined;
    try {
      response = (await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      }): DocumentPickerResponse);
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) {
        showErrorAlert('Error', e);
      }
      return;
    }

    uploadFileCallback(response.uri, response.name);
  };

  const styles = createStyleSheet({
    composeMenu: {
      flexDirection: 'row',
      overflow: 'hidden',
    },
    expandButton: {
      padding: 12,
      color: BRAND_COLOR,
    },
    composeMenuButton: {
      padding: 12,
      marginRight: -8,
      color: BRAND_COLOR,
    },
  });

  const { expanded, insertVideoCallLink, onExpandContract } = props;
  const numIcons = 2 + (Platform.OS === 'android' ? 1 : 0) + (insertVideoCallLink !== null ? 1 : 0);

  return (
    <View style={styles.composeMenu}>
      <AnimatedComponent
        stylePropertyName="width"
        fullValue={40 * numIcons}
        useNativeDriver={false}
        visible={expanded}
      >
        <View style={styles.composeMenu}>
          {Platform.OS === 'android' && (
            <IconFile style={styles.composeMenuButton} size={24} onPress={handleFilePicker} />
          )}
          <IconImage style={styles.composeMenuButton} size={24} onPress={handleImagePicker} />
          <IconCamera style={styles.composeMenuButton} size={24} onPress={handleCameraCapture} />
          {insertVideoCallLink !== null ? (
            <IconVideo style={styles.composeMenuButton} size={24} onPress={insertVideoCallLink} />
          ) : null}
        </View>
      </AnimatedComponent>
      {!expanded && (
        <IconPlusCircle style={styles.expandButton} size={24} onPress={onExpandContract} />
      )}
      {expanded && <IconLeft style={styles.expandButton} size={24} onPress={onExpandContract} />}
    </View>
  );
}
