import React from 'react';
import { Image, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { getResource, isEmojiUrl } from '../../utils/url';

const styles = StyleSheet.create({
  img: {
    width: 260,
    height: 100,
  },
});

export default ({ src, style, auth, message, pushRoute }) => {
  const resource = getResource(src, auth);
  return (
    <TouchableWithoutFeedback
      onPress={
        !isEmojiUrl(src, auth.realm)
          ? () => pushRoute('light-box', { src: resource, message, auth })
          : () => false
      }
    >
      <Image source={resource} resizeMode="contain" style={[styles.img, style]} />
    </TouchableWithoutFeedback>
  );
};
