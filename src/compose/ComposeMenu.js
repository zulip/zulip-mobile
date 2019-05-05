/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
// $FlowFixMe
import ImagePicker from 'react-native-image-picker';

import type { Dispatch, Narrow } from '../types';
import { connect } from '../react-redux';
import { showErrorAlert } from '../utils/info';
import styles from '../styles';
import { IconPlus, IconLeft, IconPeople, IconImage, IconCamera } from '../common/Icons';
import AnimatedComponent from '../animation/AnimatedComponent';
import { navigateToCreateGroup, uploadImage } from '../actions';

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
      uploadImage(
        destinationNarrow,
        response.uri,
        chooseUploadImageFilename(response.uri, response.fileName),
      ),
    );
  };

  handleImageUpload = () => {
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

  render() {
    const { dispatch, expanded, onExpandContract } = this.props;
    return (
      <View style={styles.composeMenu}>
        <AnimatedComponent
          stylePropertyName="width"
          fullValue={120}
          useNativeDriver={false}
          visible={expanded}
        >
          <View style={styles.composeMenu}>
            <IconPeople
              style={styles.composeMenuButton}
              size={24}
              onPress={() => {
                dispatch(navigateToCreateGroup());
              }}
            />
            <IconImage
              style={styles.composeMenuButton}
              size={24}
              onPress={this.handleImageUpload}
            />
            <IconCamera
              style={styles.composeMenuButton}
              size={24}
              onPress={this.handleCameraCapture}
            />
          </View>
        </AnimatedComponent>
        {!expanded && <IconPlus style={styles.expandButton} size={24} onPress={onExpandContract} />}
        {expanded && <IconLeft style={styles.expandButton} size={24} onPress={onExpandContract} />}
      </View>
    );
  }
}

export default connect()(ComposeMenu);
