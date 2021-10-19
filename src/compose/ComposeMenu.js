/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { ComponentType } from 'react';
import { Platform, View } from 'react-native';
import type { DocumentPickerResponse } from 'react-native-document-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import * as logging from '../utils/logging';
import type { Dispatch, Narrow } from '../types';
import { connect } from '../react-redux';
import { showErrorAlert } from '../utils/info';
import { BRAND_COLOR, createStyleSheet } from '../styles';
import {
  IconPlusCircle,
  IconLeft,
  IconImage,
  IconCamera,
  IconAttach,
  IconVideo,
} from '../common/Icons';
import AnimatedComponent from '../animation/AnimatedComponent';
import { uploadFile } from '../actions';

type OuterProps = $ReadOnly<{|
  expanded: boolean,
  destinationNarrow: Narrow,
  insertAttachment: (DocumentPickerResponse[]) => Promise<void>,
  insertVideoCallLink: (() => void) | null,
  onExpandContract: () => void,
|}>;

type SelectorProps = $ReadOnly<{||}>;

type Props = $ReadOnly<{|
  ...OuterProps,

  // from `connect`
  ...SelectorProps,
  dispatch: Dispatch,
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

class ComposeMenuInner extends PureComponent<Props> {
  handleImagePickerResponse = response => {
    const { dispatch, destinationNarrow } = this.props;

    if (response.didCancel === true) {
      return;
    }

    const errorCode = response.errorCode;
    if (errorCode != null) {
      showErrorAlert('Error', response.errorMessage);
      return;
    }

    // TODO: support sending multiple files; see library's docs for how to
    // let `assets` have more than one item in `response`.
    const firstAsset = response.assets && response.assets[0];

    const { uri, fileName } = firstAsset ?? {};

    if (!firstAsset || uri == null || fileName == null) {
      // TODO: If we need to keep this, wire up the user-facing string for
      // translation.
      showErrorAlert('Error', 'Something went wrong, and your message was not sent.');
      logging.error('Unexpected response from image picker', {
        '!firstAsset': !firstAsset,
        'uri == null': uri == null,
        'fileName == null': fileName == null,
      });
      return;
    }

    dispatch(uploadFile(destinationNarrow, uri, chooseUploadImageFilename(uri, fileName)));
  };

  handleImagePicker = () => {
    launchImageLibrary(
      {
        // TODO(#3624): Try 'mixed', to allow both photos and videos
        mediaType: 'photo',

        quality: 1.0,
        includeBase64: false,
      },
      this.handleImagePickerResponse,
    );
  };

  handleCameraCapture = () => {
    launchCamera(
      {
        mediaType: 'photo',

        // TODO: Do we actually need this? If not, also check if we can remove
        // the relevant WRITE_EXTERNAL_STORAGE permission in our Android
        // manifest.
        saveToPhotos: true,

        includeBase64: false,
      },
      this.handleImagePickerResponse,
    );
  };

  handleFilesPicker = async () => {
    // Defer import to here, to avoid an obnoxious import-time warning
    // from this library when in the test environment.
    const DocumentPicker = (await import('react-native-document-picker')).default;

    let response = undefined;
    try {
      response = (await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.allFiles],
      }): DocumentPickerResponse[]);
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) {
        showErrorAlert('Error', e);
      }
      return;
    }

    this.props.insertAttachment(response);
  };

  styles = createStyleSheet({
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

  render() {
    const { expanded, insertVideoCallLink, onExpandContract } = this.props;
    const numIcons =
      2 + (Platform.OS === 'android' ? 1 : 0) + (insertVideoCallLink !== null ? 1 : 0);

    return (
      <View style={this.styles.composeMenu}>
        <AnimatedComponent
          stylePropertyName="width"
          fullValue={40 * numIcons}
          useNativeDriver={false}
          visible={expanded}
        >
          <View style={this.styles.composeMenu}>
            {Platform.OS === 'android' && (
              <IconAttach
                style={this.styles.composeMenuButton}
                size={24}
                onPress={this.handleFilesPicker}
              />
            )}
            <IconImage
              style={this.styles.composeMenuButton}
              size={24}
              onPress={this.handleImagePicker}
            />
            <IconCamera
              style={this.styles.composeMenuButton}
              size={24}
              onPress={this.handleCameraCapture}
            />
            {insertVideoCallLink !== null ? (
              <IconVideo
                style={this.styles.composeMenuButton}
                size={24}
                onPress={insertVideoCallLink}
              />
            ) : null}
          </View>
        </AnimatedComponent>
        {!expanded && (
          <IconPlusCircle style={this.styles.expandButton} size={24} onPress={onExpandContract} />
        )}
        {expanded && (
          <IconLeft style={this.styles.expandButton} size={24} onPress={onExpandContract} />
        )}
      </View>
    );
  }
}

const ComposeMenu: ComponentType<OuterProps> = connect<SelectorProps, _, _>()(ComposeMenuInner);

export default ComposeMenu;
