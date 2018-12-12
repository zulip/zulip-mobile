/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { Dispatch, Context, GlobalState } from '../types';
import { getCanGoBack } from '../selectors';
import { NAVBAR_SIZE } from '../styles';
import Label from '../common/Label';
import SearchInput from '../common/SearchInput';
import NavButton from './NavButton';
import { connectPreserveOnBackOption } from '../utils/redux';
import { navigateBack } from '../actions';

const localStyles = StyleSheet.create({
  buttonCancel: {
    transform: [{ rotate: '45deg' }],
  },
});

type Props = {|
  canGoBack: boolean,
  dispatch: Dispatch,
  autoFocus: boolean,
  title: string,
  searchBar: boolean,
  searchBarOnChange: () => void,
  clearSearchInput?: () => void,
|};

type State = {|
  isSearchActive: boolean,
|};

class ModalSearchNavBar extends PureComponent<Props, State> {
  context: Context;
  state = {
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
      dispatch,
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
        {canGoBack && (
          <NavButton
            name="arrow-left"
            onPress={() => {
              dispatch(navigateBack());
            }}
          />
        )}
        {showSearchInput ? (
          <SearchInput autoFocus={autoFocus} onChangeText={searchBarOnChange} />
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

export default connect(
  (state: GlobalState) => ({
    canGoBack: getCanGoBack(state),
  }),
  null,
  null,
  connectPreserveOnBackOption,
)(ModalSearchNavBar);
