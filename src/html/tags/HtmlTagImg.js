/* @flow */
import React, { PureComponent } from 'react';

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

type Props = {
  auth: Auth,
  actions: Actions,
  className: string,
  message: Message,
  src: string,
  style: StyleObj,
};

export default class HtmlTagImg extends PureComponent<Props> {
  props: Props;

  isEmoji = () => {
    const { className, src, auth } = this.props;
    return className === 'emoji' || isEmojiUrl(src, auth.realm);
  };

  handlePress = () => {
    const { actions, message, src } = this.props;
    actions.navigateToLightbox(src, message);
  };

  render() {
    const { src, style, auth } = this.props;
    const resource = getResource(src, auth);
    const ContainerComponent = this.isEmoji() ? View : Touchable;

    return (
      <ContainerComponent onPress={this.handlePress}>
        <Image source={resource} resizeMode="contain" style={[styles.img, style]} />
      </ContainerComponent>
    );
  }
}
