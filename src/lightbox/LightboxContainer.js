/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet, Dimensions, Easing } from 'react-native';
import PhotoView from 'react-native-photo-view';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import type { Actions, Auth, Message, ImageResource } from '../types';
import connectWithActions from '../connectWithActions';
import { getAuth } from '../selectors';
import AnimatedLightboxHeader from './AnimatedLightboxHeader';
import AnimatedLightboxFooter from './AnimatedLightboxFooter';
import { constructActionSheetButtons, executeActionSheetAction } from './LightboxActionSheet';
import { NAVBAR_SIZE, LIGHTBOX_FOOTER_OFFSET, LIGHTBOX_OVERLAY_COLOR } from '../styles';

let WINDOW_WIDTH = Dimensions.get('window').width;
let WINDOW_HEIGHT = Dimensions.get('window').height;
const FOOTER_HEIGHT = 44;

const styles = StyleSheet.create({
  img: {
    height: 300,
    flex: 1,
  },
  header: {
    height: NAVBAR_SIZE,
    paddingLeft: 15,
    paddingRight: 5,
  },
  footer: {
    height: FOOTER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: 5,
  },
  overlay: {
    backgroundColor: LIGHTBOX_OVERLAY_COLOR,
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
  src: ImageResource,
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

  calculateDimensions = () => {
    WINDOW_WIDTH = Dimensions.get('window').width;
    WINDOW_HEIGHT = Dimensions.get('window').height;
  };

  handleImagePress = () => {
    this.setState(({ movement }, props) => ({
      movement: movement === 'out' ? 'in' : 'out',
    }));
  };

  handleOptionsPress = () => {
    const options = constructActionSheetButtons();
    const cancelButtonIndex = options.length - 1;
    const { showActionSheetWithOptions, src: { uri: url }, auth } = this.props;
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      buttonIndex => {
        executeActionSheetAction({
          title: options[buttonIndex],
          url,
          auth,
        });
      },
    );
  };

  getAnimationProps = () => ({
    easing: Easing.bezier(0.075, 0.82, 0.165, 1),
    duration: 300,
    movement: this.state.movement,
  });

  render() {
    this.calculateDimensions();

    const { actions, src, message, auth } = this.props;
    const footerMessage =
      message.type === 'stream' ? `Shared in #${message.display_recipient}` : 'Shared with you';

    return (
      <View style={styles.container}>
        <AnimatedLightboxHeader
          onPressBack={actions.navigateBack}
          style={[styles.overlay, styles.header, { width: WINDOW_WIDTH }]}
          from={-NAVBAR_SIZE}
          to={0}
          timestamp={message.timestamp}
          avatarUrl={message.avatar_url}
          senderName={message.sender_full_name}
          realm={auth.realm}
          {...this.getAnimationProps()}
        />
        <PhotoView
          source={src}
          minimumZoomScale={1}
          maximumZoomScale={3}
          style={[styles.img, { width: WINDOW_WIDTH }]}
          resizeMode="contain"
          onTap={this.handleImagePress}
        />
        <AnimatedLightboxFooter
          style={[styles.overlay, styles.footer, { width: WINDOW_WIDTH }]}
          displayMessage={footerMessage}
          onOptionsPress={this.handleOptionsPress}
          from={WINDOW_HEIGHT}
          to={WINDOW_HEIGHT - FOOTER_HEIGHT - LIGHTBOX_FOOTER_OFFSET}
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
