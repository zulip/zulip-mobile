/* @flow strict-local */

import React, { useContext } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { LocalizableText } from '../types';
import styles, { ThemeContext, NAVBAR_SIZE, createStyleSheet } from '../styles';
import Label from '../common/Label';
import NavBarBackButton from './NavBarBackButton';

type Props = $ReadOnly<{|
  canGoBack: boolean,
  title: LocalizableText,
|}>;

const componentStyles = createStyleSheet({
  // TODO: Does this wrapper need to exist?  There's one child, and it takes
  //   a `style` of its own.
  textWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
  },
});

export default function ModalNavBar(props: Props): Node {
  const { canGoBack, title } = props;
  const { backgroundColor } = useContext(ThemeContext);
  const textStyle = [
    styles.navTitle,
    canGoBack ? { marginRight: NAVBAR_SIZE } : { marginLeft: 16 },
  ];

  return (
    <SafeAreaView
      mode="padding"
      edges={['top', 'right', 'left']}
      style={[
        {
          borderColor: 'hsla(0, 0%, 50%, 0.25)',
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 1,
          backgroundColor,
        },
      ]}
    >
      {canGoBack && <NavBarBackButton />}
      <View style={componentStyles.textWrapper}>
        <Label style={textStyle} text={title} numberOfLines={1} ellipsizeMode="tail" />
      </View>
    </SafeAreaView>
  );
}
