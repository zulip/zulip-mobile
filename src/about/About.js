import React from 'react';
import { Text, View, StyleSheet, Linking } from 'react-native';

import Logo from '../common/Logo';

const styles = StyleSheet.create({
  mainText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  subText: {
    fontSize: 12,
    textAlign: 'center'
  },
  screen: {
    flex: 1,
    padding: 10
  },
  infoSection: {
    margin: 10
  },
 icon: {
    width: 14,
    height: 14,
    color: 'black',
    fontSize: 14,
    marginTop: 1
  }
});

const projectURL = 'https://github.com/zulip';

export default class MainScreen extends React.PureComponent {
  render() {
    return(
      <View style={styles.screen}>
        <Logo/>
        <View style={styles.infoSection}>
          <Text style={styles.mainText}> Zulip Mobile App </Text>
          <Text style={styles.subText}> version 0.3 </Text>
          <Text style={styles.subText} > Copyright Zulip 2017 </Text>
        </View>
        
        <View style={styles.infoSection}>
          <Text style={styles.subText}>
            Zulip is a powerful open source chat application.
          </Text>

          <Text style={styles.subText} onPress={() => Linking.openURL(projectURL)}>
            github.com/Zulip
          </Text>
        </View>
      </View>
    );
  }
}