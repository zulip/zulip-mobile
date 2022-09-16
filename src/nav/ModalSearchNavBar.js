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
      safeAreaView: {
        borderColor: 'hsla(0, 0%, 50%, 0.25)',
        borderBottomWidth: 1,
        backgroundColor,
        paddingHorizontal: 4,
      },
      contentArea: {
        // We should really be able to put this in styles.safeAreaView, and
        // it should control the height of the "content area" of that view,
        // excluding padding. But SafeAreaView seems to take `height` and
        // `minHeight` as controlling the height of everything including the
        // automatic vertical padding. So, we've added this separate View.
        minHeight: NAVBAR_SIZE,

        flexDirection: 'row',
        alignItems: 'center',
      },
    }),
    [backgroundColor],
  );

  return (
    <>
      <SafeAreaView mode="padding" edges={['top', 'right', 'left']} style={styles.safeAreaView}>
        {/* See comment on styles.contentArea.minHeight. */}
        <View style={styles.contentArea}>
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
        </View>
      </SafeAreaView>
      <OfflineNotice />
    </>
  );
}
