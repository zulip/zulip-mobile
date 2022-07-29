/* @flow strict-local */
import React, { useContext, useMemo } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { EditingEvent } from 'react-native/Libraries/Components/TextInput/TextInput';

import { ThemeContext, NAVBAR_SIZE } from '../styles';
import SearchInput from '../common/SearchInput';
import NavBarBackButton from './NavBarBackButton';
import type { LocalizableText } from '../types';

type Props = $ReadOnly<{|
  autoFocus: boolean,
  searchBarOnChange: (text: string) => void,
  searchBarOnSubmit: (e: EditingEvent) => void,
  placeholder?: LocalizableText,
  canGoBack?: boolean,
|}>;

export default function ModalSearchNavBar(props: Props): Node {
  // Layout based on https://material.io/components/app-bars-top .
  //
  // For details, see comment at ModalNavBar.

  const { autoFocus, searchBarOnChange, canGoBack = true, searchBarOnSubmit, placeholder } = props;
  const { backgroundColor } = useContext(ThemeContext);

  const styles = useMemo(
    () => ({
      safeAreaView: {
        minHeight: NAVBAR_SIZE,
        borderColor: 'hsla(0, 0%, 50%, 0.25)',
        borderBottomWidth: 1,
        backgroundColor,
        paddingHorizontal: 4,
        flexDirection: 'row',
        alignItems: 'center',
      },
    }),
    [backgroundColor],
  );

  return (
    <SafeAreaView mode="padding" edges={['top', 'right', 'left']} style={styles.safeAreaView}>
      {canGoBack && (
        <>
          <NavBarBackButton />
          <View style={{ width: 20 }} />
        </>
      )}
      <SearchInput
        autoFocus={autoFocus}
        onChangeText={searchBarOnChange}
        onSubmitEditing={searchBarOnSubmit}
        placeholder={placeholder}
      />
    </SafeAreaView>
  );
}
