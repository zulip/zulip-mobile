/* @flow */
import React, { PureComponent } from 'react';

import { Image, StyleSheet, View } from 'react-native';
import { getResource, isEmojiUrl } from '../../utils/url';
import type { Actions, Auth, Message, StyleObj } from '../../types';
import { Touchable } from '../../common';
import Emoji from '../../emoji/Emoji';

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

type State = {
  validImage: boolean,
};

export default class HtmlTagImg extends PureComponent<Props, State> {
  props: Props;
  state: State;

  state = {
    validImage: true,
  };

  isEmoji = () => {
    const { className, src, auth } = this.props;
    return className === 'emoji' || isEmojiUrl(src, auth.realm);
  };

  handlePress = (resource: Object) => {
    const { message, actions } = this.props;
    actions.navigateToLightbox(resource, message);
  };

  onError = () => {
    this.setState({ validImage: false });
  };

  render() {
    const { src, style, auth } = this.props;
    const { validImage } = this.state;
    const resource = getResource(src, auth);
    const ContainerComponent = this.isEmoji() ? View : Touchable;

    return (
      <ContainerComponent onPress={() => this.handlePress(resource)}>
        {validImage ? (
          <Image
            source={resource}
            resizeMode="contain"
            style={[styles.img, style]}
            onError={this.onError}
          />
        ) : (
          <Emoji name="question" />
        )}
      </ContainerComponent>
    );
  }
}
