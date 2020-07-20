/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Dispatch } from '../types';
import type { ThemeColors } from '../styles';
import { ThemeContext, NAVBAR_SIZE } from '../styles';
import { connect } from '../react-redux';
import SearchInput from '../common/SearchInput';
import NavButton from './NavButton';
import { navigateBack } from '../actions';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  autoFocus: boolean,
  searchBarOnChange: (text: string) => void,
  canGoBack: boolean,
|}>;

class ModalSearchNavBar extends PureComponent<Props> {
  static contextType = ThemeContext;
  context: ThemeColors;

  static defaultProps = {
    canGoBack: true,
  };

  render() {
    const { dispatch, autoFocus, searchBarOnChange, canGoBack } = this.props;
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
        {canGoBack && (
          <NavButton
            name="arrow-left"
            onPress={() => {
              dispatch(navigateBack());
            }}
          />
        )}

        <SearchInput autoFocus={autoFocus} onChangeText={searchBarOnChange} />
      </View>
    );
  }
}

export default connect<{||}, _, _>()(ModalSearchNavBar);
