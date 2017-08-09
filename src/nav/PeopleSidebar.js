/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import type { Actions, Narrow } from '../types';
import boundActions from '../boundActions';
import { STATUSBAR_HEIGHT } from '../styles';
import { homeNarrow, specialNarrow } from '../utils/narrow';
import NavButton from './NavButton';
import PeopleTabs from './PeopleTabs';

const componentStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: STATUSBAR_HEIGHT,
    flexDirection: 'column',
  },
  iconList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    margin: 8,
  },
});

class StreamSidebar extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  props: {
    actions: Actions,
    navigation: Object,
  };

  closeDrawer = () => {
    const { navigation } = this.props;
    navigation.navigate('DrawerClose');
  };

  narrowAndClose = (narrow: Narrow) => {
    const { actions } = this.props;
    actions.doNarrow(narrow);
    this.closeDrawer();
  };

  render() {
    const { styles } = this.context;
    const { actions } = this.props;

    return (
      <View style={[componentStyles.container, styles.background]} scrollsToTop={false}>
        <PeopleTabs screenProps={{ onNarrow: this.closeDrawer }} />
      </View>
    );
  }
}

export default connect(null, boundActions)(StreamSidebar);
