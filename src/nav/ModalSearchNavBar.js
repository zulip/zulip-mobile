/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { ThemeData } from '../styles';
import { ThemeContext, NAVBAR_SIZE } from '../styles';
import SearchInput from '../common/SearchInput';
import NavBarBackButton from './NavBarBackButton';

type Props = $ReadOnly<{|
  autoFocus: boolean,
  searchBarOnChange: (text: string) => void,
  canGoBack: boolean,
|}>;

class ModalSearchNavBar extends PureComponent<Props> {
  static contextType = ThemeContext;
  context: ThemeData;

  static defaultProps = {
    canGoBack: true,
  };

  render() {
    const { autoFocus, searchBarOnChange, canGoBack } = this.props;
    return (
      <View
        style={{
          borderColor: 'hsla(0, 0%, 50%, 0.25)',
          flexDirection: 'row',
          height: NAVBAR_SIZE,
          alignItems: 'center',
          borderBottomWidth: 1,
          backgroundColor: this.context.backgroundColor,
        }}
      >
        {canGoBack && <NavBarBackButton />}
        <SearchInput autoFocus={autoFocus} onChangeText={searchBarOnChange} />
      </View>
    );
  }
}

export default ModalSearchNavBar;
