/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Dispatch } from '../types';
import { homeNarrow, specialNarrow } from '../utils/narrow';
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
  render() {
    const { dispatch } = this.props;

    return (
      <View style={styles.wrapper}>
        <View style={styles.iconList}>
          <NavButton
            name="home"
            onPress={() => {
              dispatch(doNarrow(homeNarrow));
            }}
          />
          <NavButton
            name="star"
            onPress={() => {
              dispatch(doNarrow(specialNarrow('starred')));
            }}
          />
          <NavButton
            name="at-sign"
            onPress={() => {
              dispatch(doNarrow(specialNarrow('mentioned')));
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

export default connect(null)(HomeTab);
