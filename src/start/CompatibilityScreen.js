import React from 'react';
import { StyleSheet, Text, View, Linking, Alert } from 'react-native';

import { Logo } from '../common';
import { BRAND_COLOR } from '../common/styles';
import AppStoreLink from './AppStoreLink';

const styles = StyleSheet.create({
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
});

export default class CompatibilityScreen extends React.Component {
  handleClick = (link: string) => {
    Linking.canOpenURL(link).then(supported => {
      if (!supported) {
        Alert.alert('Loading error', 'Could not open the store.');
      } else {
        Linking.openURL(link);
      }
    }).catch(err => console.log('An error occurred ', err)); // eslint-disable-line
  }
  render() {
    return (
      <View style={styles.screen}>
        <Logo />
        <Text style={styles.text}>This is an outdated version of Zulip.</Text>
        <AppStoreLink handleClick={this.handleClick} />
      </View>
    );
  }
}
