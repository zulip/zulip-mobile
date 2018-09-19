/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
// $FlowFixMe
import ImagePicker from 'react-native-image-picker';
import { connect } from 'react-redux';

import type { Context, Dispatch, Narrow } from '../types';
import { showErrorAlert } from '../utils/info';
import { IconPlus, IconLeft, IconPeople, IconImage, IconCamera } from '../common/Icons';
import AnimatedComponent from '../animation/AnimatedComponent';
import { navigateToCreateGroup, uploadImage } from '../actions';
import { getNarrowToSendTo } from '../selectors';

type Props = {
  dispatch: Dispatch,
  expanded: boolean,
  narrow: Narrow,
  onExpandContract: () => void,
};

/**
 * In 2017, Apple adopted a new standard image format, HEIF, which stands
 * for High Efficiency File Format; Apple photos are named with the '.heic'
 * extension. When an image file with the extension '.heic' is uploaded to the
 * server,the image becomes unviewable within a message list. Interestingly,
 * the `file` command line utility reports that images saved under this format
 * are JPEG files, so there's likely some pecularity with how the server handles
 * file uploads based on the extension.
 *
 * If an image file name has the '.heic' extension, and the uri of the image on a
 * mobile device has an extension for the JPEG format, fixFileNameFromUri replaces
 * that extension with '.jpeg'.
 */
export const fixFileNameFromUri = (uri: string, fileName: string): string => {
  if (/\.jpe?g$/i.test(uri)) {
    return fileName.replace(/\.heic$/i, '.jpeg');
  }
  return fileName;
};

class ComposeMenu extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  handleImagePickerResponse = (response: Object) => {
    if (response.didCancel) {
      return;
    }

    if (response.error) {
      showErrorAlert(response.error, 'Error');
      return;
    }

    const { dispatch, narrow } = this.props;
    dispatch(
      uploadImage(narrow, response.uri, fixFileNameFromUri(response.uri, response.fileName)),
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
    const { styles } = this.context;
    const { dispatch, expanded, onExpandContract } = this.props;
    return (
      <View style={styles.composeMenu}>
        <AnimatedComponent property="width" useNativeDriver={false} visible={expanded} width={120}>
          <View style={styles.composeMenu}>
            <IconPeople
              style={styles.composeMenuButton}
              size={24}
              onPress={() => dispatch(navigateToCreateGroup())}
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

export default connect((state, props) => ({
  narrow: getNarrowToSendTo(props.narrow)(state),
}))(ComposeMenu);
