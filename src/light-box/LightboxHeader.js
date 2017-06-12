/* @flow */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import ModalNavBar from '../nav/ModalNavBar';
import { SlideAnimationView, Avatar } from '../common';
import styles from '../styles';
import { shortTime, humanDate } from '../utils/date';

const customStyles = StyleSheet.create({
  text: {
    paddingLeft: 10,
    paddingTop: 2,
    paddingBottom: 2,
    justifyContent: 'space-around',
  },
  name: {
    color: 'white',
    fontSize: 14,
    lineHeight: 14,
  },
  navBar: {
    backgroundColor: 'transparent',
    paddingTop: 0,
    borderBottomWidth: 0,
  },
  subheader: {
    color: 'white',
    fontSize: 12,
    lineHeight: 12,
  },
  children: {
    justifyContent: 'flex-start',
    paddingRight: 10,
  },
});

export default ({ popRoute, senderName, timestamp, ...restProps }) => {
  const displayDate = humanDate(new Date(timestamp * 1000));
  const time = shortTime(timestamp * 1000);
  const subheader = `${displayDate} at ${time}`;

  return (
    <SlideAnimationView property={'translateY'} {...restProps}>
      <ModalNavBar
        itemsColor="white"
        rightItem={{ name: 'ios-close-outline', onPress: popRoute, style: { fontSize: 36 } }}
        style={customStyles.navBar}
        childrenStyle={customStyles.children}
        isRightItemNav
      >
        <Avatar {...restProps} />
        <View style={customStyles.text}>
          <Text style={[styles.username, customStyles.name]} numberOfLines={1}>
            {senderName}
          </Text>
          <Text style={customStyles.subheader} numberOfLines={1}>
            {subheader}
          </Text>
        </View>
      </ModalNavBar>
    </SlideAnimationView>
  );
};
