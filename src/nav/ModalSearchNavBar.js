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
import OfflineNotice from '../common/OfflineNotice';

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
      surface: {
        borderColor: 'hsla(0, 0%, 50%, 0.25)',
        borderBottomWidth: 1,
        backgroundColor,
      },
      contentArea: {
        minHeight: NAVBAR_SIZE,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
      },
    }),
    [backgroundColor],
  );

  return (
    <SafeAreaView mode="padding" edges={['top']} style={styles.surface}>
      <OfflineNotice />
      <SafeAreaView mode="padding" edges={['right', 'left']} style={styles.contentArea}>
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
    </SafeAreaView>
  );
}
