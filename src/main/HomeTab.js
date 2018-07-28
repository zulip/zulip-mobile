/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Context, Dispatch } from '../types';
import NavButton from '../nav/NavButton';
import { Label } from '../common';
import UnreadCards from '../unread/UnreadCards';
import { navigateToSearch } from '../actions';

const componentStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
  },
});

type Props = {
  dispatch: Dispatch,
  navigation: Object,
};

class HomeTab extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { dispatch, navigation } = this.props;

    return (
      <View style={componentStyles.wrapper}>
        <UnreadCards />
      </View>
    );
  }
}

export default connect()(HomeTab);
