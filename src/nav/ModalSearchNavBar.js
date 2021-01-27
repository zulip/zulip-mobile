/* @flow strict-local */
import React, { useContext } from 'react';
import { View } from 'react-native';

import { ThemeContext, NAVBAR_SIZE } from '../styles';
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
  return (
    <View
      style={{
        borderColor: 'hsla(0, 0%, 50%, 0.25)',
        flexDirection: 'row',
        height: NAVBAR_SIZE,
        alignItems: 'center',
        borderBottomWidth: 1,
        backgroundColor,
      }}
    >
      {canGoBack && <NavBarBackButton />}
      <SearchInput autoFocus={autoFocus} onChangeText={searchBarOnChange} />
    </View>
  );
}
