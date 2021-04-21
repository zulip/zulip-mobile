/* @flow strict-local */
import React, { PureComponent } from 'react';
import { Image, Text, View, Platform } from 'react-native';

import { openLinkExternal } from '../utils/openLink';
import { Touchable } from '../common';
import { BRAND_COLOR, createStyleSheet } from '../styles';
import appStoreBadgePNG from '../../static/img/app-store-badge.png';
import googlePlayBadgePNG from '../../static/img/google-play-badge.png';

const styles = createStyleSheet({
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

export default class CompatibilityScreen extends PureComponent<{||}> {
  storeURL =
    Platform.OS === 'ios'
      ? 'https://itunes.apple.com/app/zulip/id1203036395'
      : 'https://play.google.com/store/apps/details?id=com.zulipmobile';

  openStoreURL = () => {
    openLinkExternal(this.storeURL);
  };

  render() {
    return (
      <View style={styles.screen}>
        <Text style={styles.text}>This app is too old!</Text>
        <Text style={styles.text}>Please update to the latest version.</Text>
        <View style={styles.badgeContainer}>
          <Touchable onPress={this.openStoreURL}>
            {Platform.OS === 'ios' ? <AppStoreBadge /> : <GooglePlayBadge />}
          </Touchable>
        </View>
      </View>
    );
  }
}
