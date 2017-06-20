/* @flow */
import React from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet, KeyboardAvoidingView } from 'react-native';

import { NavigationState } from '../types';
import { ZulipStatusBar } from '../common';
import ModalSearchNavBar from '../nav/ModalSearchNavBar';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  screenWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
});

class SearchScreen extends React.Component {

  props: {
    keyboardAvoiding: boolean,
    title: string,
    isSearchBarApplied: boolean,
    searchBar: boolean,
    searchBarOnChange: () => {},
    nav: NavigationState,
    children: any[]
  };

  state: {
    filter: string,
  };

  render() {
    const { keyboardAvoiding, title, searchBar } = this.props;
    const { searchBarOnChange, nav, children } = this.props;
    const WrapperView = keyboardAvoiding ? KeyboardAvoidingView : View;

    return (
      <View style={styles.screen}>
        <ZulipStatusBar />
        <ModalSearchNavBar
          title={title}
          nav={nav}
          searchBar={searchBar}
          searchBarOnChange={searchBarOnChange}
        />
        <WrapperView style={styles.screenWrapper} behavior="padding">
          {children}
        </WrapperView>
      </View>
    );
  }
}

export default connect((state) => ({
  orientation: state.app.orientation,
}))(SearchScreen);
