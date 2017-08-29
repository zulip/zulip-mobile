/* @flow */
import React from 'react';

import { Image, StyleSheet, TouchableWithoutFeedback } from 'react-native';
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

  handlePress = (resource: Object) => {
    const { className, src, auth, message, actions } = this.props;
    if (!(className === 'emoji' || isEmojiUrl(src, auth.realm))) {
      actions.navigateToLightbox(resource, message);
    }
  };

  render() {
    const { className, src, style, auth } = this.props;
    const resource = getResource(src, auth);
    const ContainerComponent =
      className === 'emoji' || isEmojiUrl(src, auth.realm) ? TouchableWithoutFeedback : Touchable;

    return (
      <ContainerComponent onPress={() => this.handlePress(resource)}>
        <Image source={resource} resizeMode="contain" style={[styles.img, style]} />
      </ContainerComponent>
    );
  }
}
