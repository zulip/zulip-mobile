/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

import type { Dispatch, Context, GlobalState } from '../types';
import { getCanGoBack } from '../selectors';
import SearchInput from '../common/SearchInput';
import NavButton from './NavButton';
import { connectPreserveOnBackOption } from '../utils/redux';
import { navigateBack } from '../actions';

type Props = {|
  canGoBack: boolean,
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
    const { dispatch, autoFocus, canGoBack, searchBarOnChange } = this.props;
    return (
      <View style={contextStyles.navBar}>
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

export default connect(
  (state: GlobalState) => ({
    canGoBack: getCanGoBack(state),
  }),
  null,
  null,
  connectPreserveOnBackOption,
)(ModalSearchNavBar);
