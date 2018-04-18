/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, Image } from 'react-native';

const styles = StyleSheet.create({
  image: {
    width: 20,
    height: 20,
  },
});

type Props = {
  url: string,
};

export default class ImageEmoji extends PureComponent<Props> {
  props: Props;

  render() {
    const { url } = this.props;

    if (!url) return null;

    return <Image style={styles.image} source={{ uri: url }} />;
  }
}
