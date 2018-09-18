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

    dispatch(uploadImage(narrow, response.uri, response.fileName));
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
