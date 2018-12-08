/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Dispatch } from '../types';
import { HOME_NARROW, MENTIONED_NARROW, STARRED_NARROW } from '../utils/narrow';
import NavButton from '../nav/NavButton';
import UnreadCards from '../unread/UnreadCards';
import { doNarrow, navigateToSearch } from '../actions';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
  },
  iconList: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
});

type Props = {
  dispatch: Dispatch,
};

class HomeTab extends PureComponent<Props> {
  props: Props;

  render() {
    const { dispatch } = this.props;

    return (
      <View style={styles.wrapper}>
        <View style={styles.iconList}>
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
