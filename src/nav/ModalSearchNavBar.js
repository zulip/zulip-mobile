/* @flow strict-local */
import React, { useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemeContext } from '../styles';
import SearchInput from '../common/SearchInput';
import NavBarBackButton from './NavBarBackButton';
import { LoadingBanner } from '../common';

type Props = $ReadOnly<{|
  autoFocus: boolean,
  searchBarOnChange: (text: string) => void,
  canGoBack?: boolean,
  shouldShowLoadingBanner: boolean,
|}>;

export default function ModalSearchNavBar(props: Props) {
  const { autoFocus, searchBarOnChange, canGoBack = true, shouldShowLoadingBanner } = props;
  const { backgroundColor } = useContext(ThemeContext);
  return (
    <SafeAreaView
      mode="padding"
      edges={['top', 'right', 'left']}
      style={{
        borderColor: 'hsla(0, 0%, 50%, 0.25)',
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        backgroundColor,
      }}
    >
      {canGoBack && <NavBarBackButton />}
      <SearchInput autoFocus={autoFocus} onChangeText={searchBarOnChange} />
      {shouldShowLoadingBanner && (
        <LoadingBanner viewStyle={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} />
      )}
    </SafeAreaView>
  );
}
