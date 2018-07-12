/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Dispatch, Context, GlobalState } from '../types';
import { getNav } from '../selectors';
import { SearchInput } from '../common';
import NavButton from './NavButton';
import { connectPreserveOnBackOption } from '../utils/redux';
import { navigateBack } from '../actions';

type Props = {
  nav: any,
  dispatch: Dispatch,
  autoFocus: boolean,
  searchBarOnChange: () => void,
};

class ModalSearchNavBar extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { dispatch, autoFocus, nav, searchBarOnChange } = this.props;

    return (
      <View style={styles.navBar}>
        {nav.index > 0 && (
          <NavButton
            name="arrow-left"
            onPress={() => {
              dispatch(navigateBack());
            }}
          />
        )}
        <SearchInput autoFocus={autoFocus} onChange={searchBarOnChange} />
      </View>
    );
  }
}

export default connect(
  (state: GlobalState) => ({
    nav: getNav(state),
  }),
  null,
  null,
  connectPreserveOnBackOption,
)(ModalSearchNavBar);
