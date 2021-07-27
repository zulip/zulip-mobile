/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { Text, View, Pressable } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '../common/Icons';
import { createStyleSheet } from '../styles';

const styles = createStyleSheet({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
  },
  text: {
    color: 'white',
    fontSize: 14,
    alignSelf: 'center',
  },
  iconTouchTarget: {
    alignSelf: 'center',
    marginVertical: 4,
  },
});

type Props = $ReadOnly<{|
  style?: ViewStyleProp,
  displayMessage: string,
  onOptionsPress: () => void,
|}>;

export default class LightboxFooter extends PureComponent<Props> {
  render(): Node {
    const { displayMessage, onOptionsPress, style } = this.props;
    return (
      <SafeAreaView mode="padding" edges={['right', 'bottom', 'left']}>
        <View style={[styles.wrapper, style]}>
          <Text style={styles.text}>{displayMessage}</Text>
          <Pressable style={styles.iconTouchTarget} onPress={onOptionsPress} hitSlop={12}>
            {({ pressed }) => (
              <Icon size={24} color={pressed ? 'gray' : 'white'} name="more-vertical" />
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
}
