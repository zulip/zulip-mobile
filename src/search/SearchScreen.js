/* @flow */
import React from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

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
    searchBar: boolean,
    children: any[],
    searchBarOnChange: () => {},
    clearInput?: () => void,
  };

  state: {
    filter: string,
  };

  render() {
    const { keyboardAvoiding, title, searchBar } = this.props;
    const { searchBarOnChange, clearInput, children } = this.props;
    const WrapperView = keyboardAvoiding && Platform.OS === 'ios' ? KeyboardAvoidingView : View;

    return (
      <View style={styles.screen}>
        <ModalSearchNavBar
          title={title}
          searchBar={searchBar}
          searchBarOnChange={searchBarOnChange}
          clearSearchInput={clearInput}
        />
        <WrapperView style={styles.screenWrapper} behavior="padding">
          {children}
        </WrapperView>
      </View>
    );
  }
}

export default connect(state => ({
  orientation: state.app.orientation,
}))(SearchScreen);
