/* @flow */
import React from 'react';

import { Image, StyleSheet, View } from 'react-native';
import { getResource, isEmojiUrl } from '../../utils/url';
import type { Actions, Auth, Message, StyleObj } from '../../types';
import { Touchable } from '../../common';

const styles = StyleSheet.create({
  img: {
    width: 260,
    height: 100,
  },
});

export default class HtmlTagImg extends React.PureComponent {
  props: {
    auth: Auth,
    actions: Actions,
    className: string,
    message: Message,
    src: string,
    style: StyleObj,
  };

  isEmoji = () => {
    const { className, src, auth } = this.props;
    return className === 'emoji' || isEmojiUrl(src, auth.realm);
  };

  handlePress = (resource: Object) => {
    const { message, actions } = this.props;
    actions.navigateToLightbox(resource, message);
  };

  render() {
    const { src, style, auth } = this.props;
    const resource = getResource(src, auth);
    const ContainerComponent = this.isEmoji() ? View : Touchable;

    return (
      <ContainerComponent onPress={() => this.handlePress(resource)}>
        <Image source={resource} resizeMode="contain" style={[styles.img, style]} />
      </ContainerComponent>
    );
  }
}
