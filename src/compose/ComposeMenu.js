/* @flow strict-local */
import React, { PureComponent } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
// $FlowFixMe
import ImagePicker from 'react-native-image-picker';

import type { Dispatch, Narrow } from '../types';
import { connect } from '../react-redux';
import { showErrorAlert } from '../utils/info';
import { BRAND_COLOR } from '../styles';
import { IconPlus, IconLeft, IconPeople, IconImage, IconCamera, IconFile } from '../common/Icons';
import AnimatedComponent from '../animation/AnimatedComponent';
import { navigateToCreateGroup, uploadFile } from '../actions';

type Props = {|
  dispatch: Dispatch,
  expanded: boolean,
  destinationNarrow: Narrow,
  onExpandContract: () => void,
|};

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
 */
export const chooseUploadImageFilename = (uri: string, fileName: string): string => {
  /*
   * Photos in an iPhone's camera roll (taken since iOS 11) are typically in
   * HEIF format and have file names with the extension `.HEIC`.  When the user
   * selects one of these photos through the image picker, the file gets
   * automatically converted to JPEG format... but the `fileName` property in
   * the react-native-image-picker response still has the `.HEIC` extension.
   */
  if (/\.jpe?g$/i.test(uri)) {
    return fileName.replace(/\.heic$/i, '.jpeg');
  }

  return fileName;
};

class ComposeMenu extends PureComponent<Props> {
  handleImagePickerResponse = (response: {
    didCancel: boolean,
    // Upstream docs are vague:
    // https://github.com/react-native-community/react-native-image-picker/blob/master/docs/Reference.md
    error?: string | void | null | false,
    uri: string,
    fileName: string,
  }) => {
    if (response.didCancel) {
      return;
    }

    // $FlowFixMe sketchy falsiness check, because upstream API is unclear
    const error: string | null = response.error || null;
    if (error !== null) {
      showErrorAlert(error, 'Error');
      return;
    }

    const { dispatch, destinationNarrow } = this.props;
    dispatch(
      uploadFile(
        destinationNarrow,
        response.uri,
        chooseUploadImageFilename(response.uri, response.fileName),
      ),
    );
  };

  handleFilePicker = () => {
    DocumentPicker.pick({ type: [DocumentPicker.types.allFiles] })
      .then((response: { uri: string, type: string, name: string, size: number }) => {
        this.handleImagePickerResponse({
          didCancel: false,
          error: null,
          uri: response.uri,
          fileName: response.name,
        });
      })
      .catch((error: string) => {
        this.handleImagePickerResponse({
          didCancel: DocumentPicker.isCancel(error),
          error,
          uri: 'error',
          fileName: 'error',
        });
      });
  };

  handleImagePicker = () => {
    ImagePicker.launchImageLibrary(
      {
        quality: 1.0,
        noData: true,
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
      },
      this.handleImagePickerResponse,
    );
  };

  handleCameraCapture = () => {
    const options = {
      storageOptions: {
        cameraRoll: true,
        waitUntilSaved: true,
      },
    };

    ImagePicker.launchCamera(options, this.handleImagePickerResponse);
  };

  styles = StyleSheet.create({
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
    const { dispatch, expanded, onExpandContract } = this.props;
    const numIcons = Platform.OS === 'android' ? 4 : 3;
    return (
      <View style={this.styles.composeMenu}>
        <AnimatedComponent
          stylePropertyName="width"
          fullValue={40 * numIcons}
          useNativeDriver={false}
          visible={expanded}
        >
          <View style={this.styles.composeMenu}>
            <IconPeople
              style={this.styles.composeMenuButton}
              size={24}
              onPress={() => {
                dispatch(navigateToCreateGroup());
              }}
            />
            {Platform.OS === 'android' && (
              <IconFile
                style={this.styles.composeMenuButton}
                size={24}
                onPress={this.handleFilePicker}
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
          </View>
        </AnimatedComponent>
        {!expanded && (
          <IconPlus style={this.styles.expandButton} size={24} onPress={onExpandContract} />
        )}
        {expanded && (
          <IconLeft style={this.styles.expandButton} size={24} onPress={onExpandContract} />
        )}
      </View>
    );
  }
}

export default connect()(ComposeMenu);
