/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet, Dimensions, Easing } from 'react-native';
import PhotoView from 'react-native-photo-view';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import type { Actions, Auth, Message } from '../types';
import connectWithActions from '../connectWithActions';
import { getAuth } from '../selectors';
import { getResource, encodeImageUri } from '../utils/url';
import AnimatedLightboxHeader from './AnimatedLightboxHeader';
import AnimatedLightboxFooter from './AnimatedLightboxFooter';
import { constructActionSheetButtons, executeActionSheetAction } from './LightboxActionSheet';
import { NAVBAR_SIZE } from '../styles';
import { getGravatarFromEmail } from '../utils/avatar';

const styles = StyleSheet.create({
  img: {
    height: 300,
    flex: 1,
  },
  header: {},
  overlay: {
    backgroundColor: 'black',
    opacity: 0.8,
    position: 'absolute',
    zIndex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

type Props = {
  auth: Auth,
  actions: Actions,
  src: string,
  message: Message,
  handleImagePress: (movement: string) => void,
  showActionSheetWithOptions: (Object, (number) => void) => void,
};

type State = {
  movement: 'in' | 'out',
};

class LightboxContainer extends PureComponent<Props, State> {
  props: Props;
  state: State;

  state = {
    movement: 'out',
  };

  handleImagePress = () => {
    this.setState(({ movement }, props) => ({
      movement: movement === 'out' ? 'in' : 'out',
    }));
  };

  handleOptionsPress = () => {
    const options = constructActionSheetButtons();
    const cancelButtonIndex = options.length - 1;
    const { showActionSheetWithOptions, src, auth } = this.props;
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      buttonIndex => {
        executeActionSheetAction({
          title: options[buttonIndex],
          src,
          auth,
        });
      },
    );
  };

  handlePressBack = () => {
    const { actions } = this.props;
    actions.navigateBack();
  };

  getAnimationProps = () => ({
    easing: Easing.bezier(0.075, 0.82, 0.165, 1),
    duration: 300,
    movement: this.state.movement,
  });

  render() {
    const { src, message, auth } = this.props;
    const footerMessage =
      message.type === 'stream' ? `Shared in #${message.display_recipient}` : 'Shared with you';

    /* PhotoView is not reliable for Image URIs that include non-Ascii characters.
     * Before passing the image uri we have to the 'source' attribute of PhotoView,
     * make sure that every non-ascii character is properly percent-encoded.
     */
    const resource = getResource(encodeImageUri(src), auth);
    const { width, height } = Dimensions.get('window');

    return (
      <View style={styles.container}>
        <AnimatedLightboxHeader
          onPressBack={this.handlePressBack}
          style={[styles.overlay, styles.header, { width }]}
          from={-NAVBAR_SIZE}
          to={0}
          timestamp={message.timestamp}
          avatarUrl={message.avatar_url || getGravatarFromEmail(message.sender_email)}
          senderName={message.sender_full_name}
          realm={auth.realm}
          {...this.getAnimationProps()}
        />
        <PhotoView
          source={resource}
          style={[styles.img, { width }]}
          resizeMode="contain"
          onTap={this.handleImagePress}
        />
        <AnimatedLightboxFooter
          style={[styles.overlay, { width, bottom: height - 44 }]}
          displayMessage={footerMessage}
          onOptionsPress={this.handleOptionsPress}
          from={height}
          to={height - 44}
          {...this.getAnimationProps()}
        />
      </View>
    );
  }
}

export default connectActionSheet(
  connectWithActions(state => ({
    auth: getAuth(state),
  }))(LightboxContainer),
);
