/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View, Dimensions, Easing } from 'react-native';
import PhotoView from 'react-native-photo-view';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import * as NavigationService from '../nav/NavigationService';
import type { Auth, Dispatch, Message } from '../types';
import { connect } from '../react-redux';
import type { ShowActionSheetWithOptions } from '../message/messageActionSheet';
import { getAuth } from '../selectors';
import { getResource } from '../utils/url';
import { SlideAnimationView } from '../common';
import LightboxHeader from './LightboxHeader';
import LightboxFooter from './LightboxFooter';
import { constructActionSheetButtons, executeActionSheetAction } from './LightboxActionSheet';
import { NAVBAR_SIZE, createStyleSheet } from '../styles';
import { navigateBack } from '../actions';
import { streamNameOfStreamMessage } from '../utils/recipient';

const styles = createStyleSheet({
  img: {
    height: 300,
    flex: 1,
  },
  header: {},
  overlay: {
    backgroundColor: 'black',
    opacity: 0.8,
    position: 'absolute',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

type Props = $ReadOnly<{|
  auth: Auth,
  dispatch: Dispatch,
  src: string,
  message: Message,
  showActionSheetWithOptions: ShowActionSheetWithOptions,
|}>;

type State = {|
  movement: 'in' | 'out',
|};

class Lightbox extends PureComponent<Props, State> {
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
    NavigationService.dispatch(navigateBack());
  };

  render() {
    const { src, message, auth } = this.props;
    const footerMessage =
      message.type === 'stream'
        ? `Shared in #${streamNameOfStreamMessage(message)}`
        : 'Shared with you';
    const resource = getResource(src, auth);
    const { width, height } = Dimensions.get('window');

    const animationProps = {
      easing: Easing.bezier(0.075, 0.82, 0.165, 1),
      duration: 300,
      movement: this.state.movement,
    };

    return (
      <View style={styles.container}>
        <PhotoView
          source={resource}
          style={[styles.img, { width }]}
          resizeMode="contain"
          onTap={this.handleImagePress}
          onViewTap={this.handleImagePress}
        />
        <SlideAnimationView
          property="translateY"
          style={[styles.overlay, styles.header, { width }]}
          from={-NAVBAR_SIZE}
          to={0}
          {...animationProps}
        >
          <LightboxHeader
            onPressBack={this.handlePressBack}
            timestamp={message.timestamp}
            avatarUrl={message.avatar_url}
            senderName={message.sender_full_name}
            senderEmail={message.sender_email}
          />
        </SlideAnimationView>
        <SlideAnimationView
          property="translateY"
          style={[styles.overlay, { width, bottom: height - 44 }]}
          from={height}
          to={height - 44}
          {...animationProps}
        >
          <LightboxFooter displayMessage={footerMessage} onOptionsPress={this.handleOptionsPress} />
        </SlideAnimationView>
      </View>
    );
  }
}

export default connectActionSheet(
  connect(state => ({
    auth: getAuth(state),
  }))(Lightbox),
);
