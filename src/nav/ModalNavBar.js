/* @flow strict-local */

import React, { useContext } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { LocalizableText } from '../types';
import styles, { ThemeContext, NAVBAR_SIZE } from '../styles';
import Label from '../common/Label';
import NavBarBackButton from './NavBarBackButton';
import { LoadingBar } from '../common';

type Props = $ReadOnly<{|
  canGoBack: boolean,
  title: LocalizableText,
  shouldShowLoadingBar: boolean,
|}>;

export default function ModalNavBar(props: Props) {
  const { canGoBack, title, shouldShowLoadingBar } = props;
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
      <View style={styles.flexedLeftAlign}>
        <Label style={textStyle} text={title} numberOfLines={1} ellipsizeMode="tail" />
      </View>
      {shouldShowLoadingBar && (
        <LoadingBar viewStyle={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} />
      )}
    </SafeAreaView>
  );
}
