/* @flow */
import React from 'react';
import { Text, StyleSheet } from 'react-native';

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

export default ({ displayMessage, onPress, ...restProps }) => (
  <SlideAnimationView property={'translateY'} {...restProps}>
    <Text style={styles.text}>{displayMessage}</Text>
    <NavButton name="ios-more" color="white" style={styles.icon} onPress={onPress} />
  </SlideAnimationView>
);
