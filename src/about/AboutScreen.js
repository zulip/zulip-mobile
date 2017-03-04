import React from 'react';
import { View,
          Text,
          StyleSheet,
          TouchableOpacity,
          Linking,
        } from 'react-native';
import Logo from './Logo';

export const BRAND_COLOR = 'rgba(66, 163, 109, 1)';
const styles = StyleSheet.create({
  initialText: {
    borderBottomWidth: 0,
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 1,
    paddingLeft: 3,
    paddingRight: 3,
    paddingBottom: 4,
    marginTop: 3,
    marginLeft: 5,
    marginRight: 5,
  },
  mainHeader: {
    marginTop: 40,
    padding: 5,
    color: BRAND_COLOR,
    fontSize: 13,
  },
  mainText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  screen: {
    flex: 1,
    padding: 10,
  },
  cardSection: {
    padding: 3,
    paddingTop: 5,
  },
  insideText: {
    fontSize: 16,
    marginBottom: 8,
  },
  grayedText: {
    color: '#BDBDBD',
    marginLeft: 4,
    fontSize: 14,
  },
  outlineContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 100,
  },
  links: {
    fontWeight: 'bold',
  },
  copyrights: {
    color: '#BDBDBD',
    textAlign: 'center',
  },
});
class AboutScreen extends React.PureComponent {
  render() {
    return (
      <View style={styles.screen}>
        <Logo />
        <Text style={styles.mainText}> Zulip Mobile App </Text>
        <Text style={styles.subText}>
          Zulip is a powerful open source chat application.
        </Text>
        <View style={styles.outlineContent}>
          <View>
            <Text style={styles.mainHeader}>About</Text>
            <View style={styles.initialText}>
              <TouchableOpacity>
                <View style={styles.cardSection}>
                  <Text style={styles.insideText}> Version</Text>
                  <Text style={styles.grayedText}>Zulip App v0.3</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.initialText}>
              <TouchableOpacity onPress={() => Linking.openURL('https://github.com/zulip/zulip-mobile/blob/master/LICENSE')}>
                <View style={styles.cardSection}>
                  <Text style={styles.insideText}> License</Text>
                  <Text style={styles.grayedText}>Apache License 2.0</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View>
            <Text style={styles.mainHeader}>Contribute</Text>
            <View style={styles.initialText}>
              <View>
                <View style={styles.cardSection}>
                  <Text style={styles.insideText}>Codebase</Text>
                  <Text style={styles.grayedText}>All our code is on
                    <Text style={styles.links} onPress={() => Linking.openURL('https://github.com/zulip/')}> GitHub </Text>
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.initialText}>
              <View>
                <View style={styles.cardSection}>
                  <Text style={styles.insideText}> Get Started</Text>
                  <Text style={styles.grayedText}>Check out our
                    <Text style={styles.links} onPress={() => Linking.openURL('http://zulip.readthedocs.io/en/latest/readme-symlink.html#ways-to-contribute')}> contribution guide </Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View >
          <Text style={styles.copyrights}>
          Copyright© Zulip 2017
          </Text>
        </View>
      </View>
    );
  }
}

export default AboutScreen;
