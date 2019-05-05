/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Dispatch, Context } from '../types';
import { connect } from '../react-redux';
import SearchInput from '../common/SearchInput';
import NavButton from './NavButton';
import { navigateBack } from '../actions';

type Props = {|
  dispatch: Dispatch,
  autoFocus: boolean,
  searchBarOnChange: (text: string) => void,
|};

class ModalSearchNavBar extends PureComponent<Props> {
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles: contextStyles } = this.context;
    const { dispatch, autoFocus, searchBarOnChange } = this.props;
    return (
      <View style={contextStyles.navBar}>
        <NavButton
          name="arrow-left"
          onPress={() => {
            dispatch(navigateBack());
          }}
        />
        <SearchInput autoFocus={autoFocus} onChangeText={searchBarOnChange} />
      </View>
    );
  }
}

export default connect()(ModalSearchNavBar);
