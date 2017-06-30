/* @flow */
import React from 'react';
import { View, StyleSheet, Dimensions, Easing } from 'react-native';
import { connect } from 'react-redux';
import PhotoView from 'react-native-photo-view';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import Header from './LightboxHeader';
import Footer from './LightboxFooter';
import boundActions from '../boundActions';
import { constructActionSheetButtons, executeActionSheetAction } from './LightboxActionSheet';
import { NAVBAR_HEIGHT, LIGHTBOX_FOOTER_OFFSET, LIGHTBOX_OVERLAY_COLOR } from '../styles';

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;
const FOOTER_HEIGHT = 44;

const styles = StyleSheet.create({
  img: {
    width: WINDOW_WIDTH,
    height: 300,
    flex: 1,
  },
  header: {
    width: WINDOW_WIDTH,
    height: NAVBAR_HEIGHT,
    paddingLeft: 15,
    paddingRight: 5,
  },
  footer: {
    width: WINDOW_WIDTH,
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

class LightboxContainer extends React.PureComponent {
  static contextTypes = {
    styles: () => null,
  };

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

  getFooterMessage = () => {
    const { type, display_recipient: stream } = this.props.message;
    return type === 'stream' ? `Shared in #${stream}` : 'Shared with you';
  };

  getAnimationProps = () => ({
    easing: Easing.bezier(0.075, 0.82, 0.165, 1),
    duration: 300,
    movement: this.state.movement,
  });

  getHeaderProps = () => {
    const {
      popRoute,
      message: { timestamp, sender_full_name: senderName, avatar_url: avatarUrl },
      auth: { realm },
    } = this.props;
    return {
      styles: this.context.styles,
      style: [styles.overlay, styles.header],
      from: -NAVBAR_HEIGHT,
      to: 0,
      popRoute,
      timestamp,
      avatarUrl,
      senderName,
      realm,
    };
  };

  getFooterProps = () => ({
    displayMessage: this.getFooterMessage(),
    onPress: this.handleOptionsPress,
    style: [styles.overlay, styles.footer],
    from: WINDOW_HEIGHT,
    to: WINDOW_HEIGHT - FOOTER_HEIGHT - LIGHTBOX_FOOTER_OFFSET,
  });

  getImageProps = () => ({
    source: this.props.src,
    minimumZoomScale: 1,
    maximumZoomScale: 3,
    style: styles.img,
    resizeMode: 'contain',
    onTap: this.handleImagePress,
  });

  render() {
    return (
      <View style={styles.container}>
        <Header {...this.getAnimationProps()} {...this.getHeaderProps()} />
        <PhotoView {...this.getImageProps()} />
        <Footer {...this.getAnimationProps()} {...this.getFooterProps()} />
      </View>
    );
  }
}

export default connectActionSheet(connect(null, boundActions)(LightboxContainer));
