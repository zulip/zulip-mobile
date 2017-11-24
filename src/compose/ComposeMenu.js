/* @flow */
import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
// $FlowFixMe
import ImagePicker from 'react-native-image-picker';

import type { Actions, Narrow } from '../types';
import { BRAND_COLOR } from '../styles';
import { Touchable } from '../common';
import { showErrorAlert } from '../common/errorAlert';
import { IconPlus, IconLeft, IconPeople, IconImage, IconCamera } from '../common/Icons';
import AnimatedComponent from '../animation/AnimatedComponent';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  touchable: {},
  button: {
    padding: 8,
    color: BRAND_COLOR,
  },
});

type Props = {
  actions: Actions,
  expanded: boolean,
  narrow: Narrow,
  onExpandContract: () => void,
};

export default class ComposeMenu extends Component<Props> {
  props: Props;

  handleImagePickerResponse = (response: Object) => {
    if (response.didCancel) {
      return;
    }

    if (response.error) {
      showErrorAlert(response.error, 'Error');
      return;
    }

    const { actions, narrow } = this.props;

    actions.uploadImage(narrow, response.uri, response.fileName);
  };

  handleImageUpload = () => {
    ImagePicker.launchImageLibrary(
      {
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
      },
      this.handleImagePickerResponse,
    );
  };

  handleCameraCapture = () => {
    ImagePicker.launchCamera({}, this.handleImagePickerResponse);
  };

  render() {
    const { actions, expanded, onExpandContract } = this.props;

    return (
      <View style={styles.wrapper}>
        <AnimatedComponent property="width" useNativeDriver={false} visible={expanded} width={124}>
          <View style={styles.wrapper}>
            <IconPeople style={styles.button} size={24} onPress={actions.navigateToCreateGroup} />
            <IconImage style={styles.button} size={24} onPress={this.handleImageUpload} />
            <IconCamera style={styles.button} size={24} onPress={this.handleCameraCapture} />
          </View>
        </AnimatedComponent>
        <Touchable style={styles.touchable} onPress={onExpandContract}>
          {!expanded && <IconPlus style={styles.button} size={24} />}
          {expanded && <IconLeft style={styles.button} size={24} />}
        </Touchable>
      </View>
    );
  }
}
