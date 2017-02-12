import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import { BRAND_COLOR } from '../common/styles';
import { STATUSBAR_HEIGHT } from './platform';

const styles = StyleSheet.create({
  statusbar: {
    backgroundColor: BRAND_COLOR,
    height: STATUSBAR_HEIGHT,
  },
  landscape: {
    height: 0,
  }
});

const ZulipStatusBar = ({ orientation }) => (
  <View
    style={[
      styles.statusbar,
      orientation === 'LANDSCAPE' && styles.landscape,
    ]}
  >
    <StatusBar
      animated
      hidden={orientation === 'LANDSCAPE'}
      barStyle="light-content"
      backgroundColor={BRAND_COLOR}
      showHideTransition="slide"
    />
  </View>
);

export default connect((state) => ({
  orientation: state.app.orientation,
}))(ZulipStatusBar);
