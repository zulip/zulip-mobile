/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { Context, GlobalState } from '../types';
import { getCanGoBack } from '../selectors';
import { NAVBAR_SIZE } from '../styles';
import { Label, SearchInput } from '../common';
import NavButton from './NavButton';
import BackButton from './BackButton';
import { connectPreserveOnBackOption } from '../utils/redux';

const localStyles = StyleSheet.create({
  buttonCancel: {
    transform: [{ rotate: '45deg' }],
  },
});

type Props = {
  canGoBack: boolean,
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
  state: State = {
    isSearchActive: false,
  };

  static contextTypes = {
    styles: () => null,
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
      autoFocus,
      canGoBack,
      title,
      searchBar,
      searchBarOnChange,
      clearSearchInput,
    } = this.props;
    const showSearchInput = isSearchActive || !searchBar;
    const textStyle = [
      styles.navTitle,
      canGoBack && showSearchInput && { marginRight: NAVBAR_SIZE },
    ];

    return (
      <View style={styles.navBar}>
        <BackButton />
        {showSearchInput ? (
          <SearchInput autoFocus={autoFocus} onChange={searchBarOnChange} />
        ) : (
          <Label style={textStyle} text={title} />
        )}
        {!showSearchInput && (
          <NavButton
            accessibilityLabel="Search"
            name="search"
            onPress={this.enableSearchActiveState}
          />
        )}
        {showSearchInput
          && clearSearchInput && (
            <NavButton
              accessibilityLabel="Clear search"
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

export default connect(
  (state: GlobalState) => ({
    canGoBack: getCanGoBack(state),
  }),
  null,
  null,
  connectPreserveOnBackOption,
)(ModalSearchNavBar);
