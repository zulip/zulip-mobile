/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, Image, Text, View, Platform, Linking } from 'react-native';

import { Touchable } from '../common';
import { BRAND_COLOR } from '../styles';
import appStoreBadgePNG from '../../static/img/app-store-badge.png';
import googlePlayBadgePNG from '../../static/img/google-play-badge.png';
import type { ChildrenArray } from '../types';

const styles = StyleSheet.create({
  appStoreBadge: {
    width: 180,
    height: 60,
    alignSelf: 'center',
  },
  googlePlayBadge: {
    height: 80,
    width: 210,
    alignSelf: 'center',
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: BRAND_COLOR,
  },
  text: {
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
    margin: 8,
  },
  badgeContainer: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

const AppStoreBadge = () => (
  <Image style={styles.appStoreBadge} source={appStoreBadgePNG} resizeMode="contain" />
);

const GooglePlayBadge = () => (
  <Image style={styles.googlePlayBadge} source={googlePlayBadgePNG} resizeMode="contain" />
);

type Props = {
  incompatibilityText?: string,
  children?: ChildrenArray<*>,
};
export default class CompatibilityScreen extends PureComponent<Props> {
  storeURL = Platform.OS === 'ios'
    ? 'https://itunes.apple.com/app/zulip/id1203036395'
    : 'https://play.google.com/store/apps/details?id=com.zulipmobile';

  openStoreURL = () => {
    Linking.openURL(this.storeURL);
  };

  render() {
    return (
      <View style={styles.screen}>
        <Text style={styles.text}>{this.props.incompatibilityText}</Text>
        <Text style={styles.text}>Please update to the latest version.</Text>
        <View style={styles.badgeContainer}>
          <Touchable onPress={this.openStoreURL}>
            {Platform.OS === 'ios' ? <AppStoreBadge /> : <GooglePlayBadge />}
          </Touchable>
        </View>
        <View>{this.props.children}</View>
      </View>
    );
  }
}
