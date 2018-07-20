/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { homeNarrow, specialNarrow } from '../utils/narrow';
import NavButton from '../nav/NavButton';
import UnreadCards from '../unread/UnreadCards';
import { doNarrow, navigateToSearch } from '../actions';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
  },
});

export default class HomeTab extends PureComponent<Props> {
  render() {
    return (
      <View style={styles.wrapper}>
        <UnreadCards />
      </View>
    );
  }
}
