/* @flow */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import type { Actions } from '../types';
import boundActions from '../boundActions';
import { CONTROL_SIZE } from '../styles';
import { Label, SearchInput } from '../common';
import NavButton from './NavButton';

const localStyles = StyleSheet.create({
  buttonCancel: {
    transform: [{ rotate: '45deg' }],
  },
});

class ModalSearchNavBar extends React.Component {
  static contextTypes = {
    styles: () => null,
  };

  props: {
    nav: any,
    actions: Actions,
    title: string,
    searchBar: boolean,
    searchBarOnChange: () => void,
    clearSearchInput?: () => void,
  };

  state: {
    isSearchActive: boolean,
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
    const { actions, nav, title, searchBar, searchBarOnChange, clearSearchInput } = this.props;
    const showSearchInput = isSearchActive || !searchBar;
    const textStyle = [
      styles.navTitle,
      nav.index > 0 && showSearchInput && { marginRight: CONTROL_SIZE },
    ];

    return (
      <View style={styles.navBar}>
        {nav.index > 0 && <NavButton name="ios-arrow-back" onPress={actions.navigateBack} />}
        {showSearchInput
          ? <SearchInput onChange={searchBarOnChange} />
          : <Label style={textStyle} text={title} />}
        {!showSearchInput && <NavButton name="ios-search" onPress={this.enableSearchActiveState} />}
        {showSearchInput &&
          clearSearchInput &&
          <NavButton
            name="md-add"
            style={localStyles.buttonCancel}
            onPress={() => {
              this.disableSearchActiveState();
              clearSearchInput();
            }}
          />}
      </View>
    );
  }
}

export default connect(
  state => ({
    nav: state.nav,
  }),
  boundActions,
)(ModalSearchNavBar);
