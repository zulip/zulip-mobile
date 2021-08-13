/* @flow strict-local */
import React, { useContext } from 'react';
import type { Node } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemeContext } from '../styles';
import SearchInput from '../common/SearchInput';
import NavBarBackButton from './NavBarBackButton';

type Props = $ReadOnly<{|
  autoFocus: boolean,
  searchBarOnChange: (text: string) => void,
  canGoBack?: boolean,
|}>;

/**
 * A flavor of top nav / app bar for Screen with search bar and back button.
 *
 * Pads the top, right, and left insets with its background.
 */
export default function ModalSearchNavBar(props: Props): Node {
  const { autoFocus, searchBarOnChange, canGoBack = true } = props;
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
    </SafeAreaView>
  );
}
