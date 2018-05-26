/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { Actions, Context } from '../types';
import { connectWithActionsPreserveOnBack } from '../connectWithActions';
import { getNav } from '../selectors';
import { NAVBAR_SIZE } from '../styles';
import { Label, SearchInput } from '../common';
import NavButton from './NavButton';

const localStyles = StyleSheet.create({
  buttonCancel: {
    transform: [{ rotate: '45deg' }],
  },
});

type Props = {
  nav: any,
  actions: Actions,
  autoFocus: boolean,
  title: string,
  searchBar: boolean,
  searchBarOnChange: () => void,
  clearSearchInput?: () => void,
};

type State = {
  isSearchActive: boolean,
};

class ModalSearchNavBar extends PureComponent<Props, State> {
  context: Context;
  props: Props;
  state: State;

  static contextTypes = {
    styles: () => null,
  };

  state = {
    isSearchActive: false,
  };

  enableSearchActiveState = () => {
    this.setState({
      isSearchActive: true,
    });
  };

  disableSearchActiveState = () => {
    this.setState({
      isSearchActive: false,
    });
  };

  render() {
    const { styles } = this.context;
    const { isSearchActive } = this.state;
    const {
      actions,
      autoFocus,
      nav,
      title,
      searchBar,
      searchBarOnChange,
      clearSearchInput,
    } = this.props;
    const showSearchInput = isSearchActive || !searchBar;
    const textStyle = [
      styles.navTitle,
      nav.index > 0 && showSearchInput && { marginRight: NAVBAR_SIZE },
    ];

    return (
      <View style={styles.navBar}>
        {nav.index > 0 && <NavButton name="arrow-left" onPress={actions.navigateBack} />}
        {showSearchInput ? (
          <SearchInput autoFocus={autoFocus} onChange={searchBarOnChange} />
        ) : (
          <Label style={textStyle} text={title} />
        )}
        {!showSearchInput && <NavButton name="search" onPress={this.enableSearchActiveState} />}
        {showSearchInput
          && clearSearchInput && (
            <NavButton
              name="md-add"
              style={localStyles.buttonCancel}
              onPress={() => {
                this.disableSearchActiveState();
                clearSearchInput();
              }}
            />
          )}
      </View>
    );
  }
}

export default connectWithActionsPreserveOnBack(state => ({
  nav: getNav(state),
}))(ModalSearchNavBar);
