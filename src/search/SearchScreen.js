/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

import ModalSearchNavBar from '../nav/ModalSearchNavBar';

const componentStyles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
});

class SearchScreen extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  props: {
    keyboardAvoiding: boolean,
    title: string,
    searchBar: boolean,
    children: any[],
    searchBarOnChange: () => void,
  };

  render() {
    const { styles } = this.context;
    const { keyboardAvoiding, title, searchBar, searchBarOnChange, children } = this.props;
    const WrapperView = keyboardAvoiding && Platform.OS === 'ios' ? KeyboardAvoidingView : View;

    return (
      <View style={styles.screen}>
        <ModalSearchNavBar
          title={title}
          searchBar={searchBar}
          searchBarOnChange={searchBarOnChange}
        />
        <WrapperView style={componentStyles.screenWrapper} behavior="padding">
          {children}
        </WrapperView>
      </View>
    );
  }
}

export default connect(state => ({
  orientation: state.app.orientation,
}))(SearchScreen);
