/* @flow strict-local */
import React, { useContext } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeContext } from '../styles';
import SearchInput from '../common/SearchInput';
import NavBarBackButton from './NavBarBackButton';

type Props = $ReadOnly<{|
  autoFocus: boolean,
  searchBarOnChange: (text: string) => void,
  canGoBack?: boolean,
|}>;

export default function ModalSearchNavBar(props: Props) {
  const { autoFocus, searchBarOnChange, canGoBack = true } = props;
  const { backgroundColor } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        borderColor: 'hsla(0, 0%, 50%, 0.25)',
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        backgroundColor,
        paddingTop: insets.top,
      }}
    >
      {canGoBack && <NavBarBackButton />}
      <SearchInput autoFocus={autoFocus} onChangeText={searchBarOnChange} />
    </View>
  );
}
