/* @flow strict-local */
import React, { PureComponent } from 'react';
import { Text, View, Image, TouchableWithoutFeedback } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import type { ThemeName } from '../../reduxTypes';
import { createStyleSheet } from '../../styles';
import TranslatedText from '../../common/TranslatedText';
import appleLogoBlackImg from '../../../static/img/apple-logo-black.png';
import appleLogoWhiteImg from '../../../static/img/apple-logo-white.png';

const styles = createStyleSheet({
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  frame: {
    height: 44,
    justifyContent: 'center',
    borderRadius: 22,
    overflow: 'hidden',
  },
  nightFrame: {
    backgroundColor: 'black',
  },
  dayFrame: {
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: 'black',
  },
  text: {
    fontSize: 16,
  },
  nightText: {
    color: 'white',
  },
  dayText: {
    color: 'black',
  },
});

type Props = $ReadOnly<{|
  style?: ViewStyleProp,
  onPress: () => void | Promise<void>,
  theme: ThemeName,
|}>;

/**
 * The custom "Sign in with Apple" button that follows the rules.
 *
 * Do not reuse this component; it is only meant to be rendered by the
 * IosCompliantAppleAuthButton, which controls whether the custom
 * button should be used.
 */
export default class Custom extends PureComponent<Props> {
  render() {
    const { style, onPress, theme } = this.props;
    const logoSource = theme === 'default' ? appleLogoBlackImg : appleLogoWhiteImg;
    const frameStyle = [
      styles.frame,
      theme === 'default' ? styles.dayFrame : styles.nightFrame,
      style,
    ];
    const textStyle = [styles.text, theme === 'default' ? styles.dayText : styles.nightText];

    return (
      <View style={frameStyle}>
        <TouchableWithoutFeedback onPress={onPress}>
          <View style={styles.buttonContent}>
            <Image source={logoSource} />
            <Text style={textStyle}>
              <TranslatedText text="Sign in with Apple" />
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }
}
