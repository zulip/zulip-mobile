/* @flow */
import React from 'react';
import { Text, StyleSheet, View } from 'react-native';

import type { StyleObj } from '../types';
import { SlideAnimationView } from '../common';
import NavButton from '../nav/NavButton';

const styles = StyleSheet.create({
  text: {
    color: 'white',
    fontSize: 16,
    lineHeight: 16,
  },
  icon: {
    fontSize: 32,
  },
});

type FooterProps = {
  displayMessage: string,
  onOptionsPress: () => void,
  style: StyleObj,
};

type Props = {
  displayMessage: string,
  onOptionsPress: () => void,
  from: number,
  to: number,
  style: StyleObj,
};

export const Footer = ({ displayMessage, onOptionsPress, style }: FooterProps) =>
  <View style={style}>
    <Text style={styles.text}>
      {displayMessage}
    </Text>
    <NavButton name="ios-more" color="white" style={styles.icon} onPress={onOptionsPress} />
  </View>;

export default ({ displayMessage, onOptionsPress, style, ...restProps }: Props) =>
  <SlideAnimationView property={'translateY'} style={style} {...restProps}>
    <Footer displayMessage={displayMessage} onOptionsPress={onOptionsPress} style={style} />
  </SlideAnimationView>;
