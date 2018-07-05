/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Context, Dispatch } from '../types';
import { HOME_NARROW, MENTIONED_NARROW, STARRED_NARROW } from '../utils/narrow';
import NavButton from '../nav/NavButton';
import UnreadCards from '../unread/UnreadCards';
import { doNarrow, navigateToSearch } from '../actions';

const componentStyles = StyleSheet.create({
  iconList: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
});

type Props = {
  dispatch: Dispatch,
};

class HomeTab extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { dispatch } = this.props;

    return (
      <View style={styles.tabContainer}>
        <View style={componentStyles.iconList}>
          <NavButton
            name="home"
            onPress={() => {
              dispatch(doNarrow(HOME_NARROW));
            }}
          />
          <NavButton
            name="star"
            onPress={() => {
              dispatch(doNarrow(STARRED_NARROW));
            }}
          />
          <NavButton
            name="at-sign"
            onPress={() => {
              dispatch(doNarrow(MENTIONED_NARROW));
            }}
          />
          <NavButton
            name="search"
            onPress={() => {
              dispatch(navigateToSearch());
            }}
          />
        </View>
        <UnreadCards />
      </View>
    );
  }
}

export default connect()(HomeTab);
