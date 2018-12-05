/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { View, StyleSheet, Dimensions, Easing } from 'react-native';
import PhotoView from 'react-native-photo-view';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import type { Auth, Dispatch, GlobalState, Message } from '../types';
import { getAuth } from '../selectors';
import { getResource } from '../utils/url';
import AnimatedLightboxHeader from './AnimatedLightboxHeader';
import AnimatedLightboxFooter from './AnimatedLightboxFooter';
import { constructActionSheetButtons, executeActionSheetAction } from './LightboxActionSheet';
import { NAVBAR_SIZE } from '../styles';
import { getGravatarFromEmail } from '../utils/avatar';
import { navigateBack } from '../actions';
import { LoadingIndicator } from '../common';

const styles = StyleSheet.create({
  img: {
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
  dispatch: Dispatch,
  src: string,
  message: Message,
  showActionSheetWithOptions: (Object, (number) => void) => void,
};

type State = {
  movement: 'in' | 'out',
  loaded: boolean,
};

class Lightbox extends PureComponent<Props, State> {
  props: Props;
  state: State = {
    movement: 'out',
    loaded: false,
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
    const { dispatch } = this.props;
    dispatch(navigateBack());
  };

  getAnimationProps = () => ({
    easing: Easing.bezier(0.075, 0.82, 0.165, 1),
    duration: 300,
    movement: this.state.movement,
  });

  showImage = () => {
    this.setState({
      loaded: true,
    });
  };

  render() {
    const { src, message, auth } = this.props;
    const footerMessage =
      message.type === 'stream' ? `Shared in #${message.display_recipient}` : 'Shared with you';
    const resource = getResource(src, auth);
    const { width, height } = Dimensions.get('window');
    const displayImage = this.state.loaded ? 'flex' : 'none';

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
        {!this.state.loaded && <LoadingIndicator />}
        <PhotoView
          source={resource}
          style={[styles.img, { width }, { display: displayImage }]}
          resizeMode="contain"
          onLoadEnd={this.showImage}
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
  connect((state: GlobalState) => ({
    auth: getAuth(state),
  }))(Lightbox),
);
