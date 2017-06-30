/* @flow */
import React from 'react';

import { Image, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { getResource, isEmojiUrl } from '../../utils/url';
import type { Auth, Message, PushRouteAction, StyleObj } from '../../types';
import { Touchable } from '../../common';

const styles = StyleSheet.create({
  img: {
    width: 260,
    height: 100,
  },
});

export default class HtmlTagImg extends React.PureComponent {

  props: {
    src: string,
    auth: Auth,
    message: Message,
    pushRoute: PushRouteAction,
    style: StyleObj,
  };

  handlePress = (resource: Object) => {
    const { src, auth, message, pushRoute } = this.props;
    if (!isEmojiUrl(src, auth.realm)) {
      pushRoute('light-box', { src: resource, message, auth });
    }
  };

  render() {
    const { src, style, auth } = this.props;
    const resource = getResource(src, auth);
    const ContainerComponent = isEmojiUrl ? TouchableWithoutFeedback : Touchable;
    return (
      <ContainerComponent onPress={() => this.handlePress(resource)}>
        <Image source={resource} resizeMode="contain" style={[styles.img, style]} />
      </ContainerComponent>
    );
  }
}
