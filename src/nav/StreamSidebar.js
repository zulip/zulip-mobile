/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import type { Actions, Narrow } from '../types';
import boundActions from '../boundActions';
import { STATUSBAR_HEIGHT } from '../styles';
import { homeNarrow, specialNarrow } from '../utils/narrow';
import NavButton from './NavButton';
import StreamTabs from './StreamTabs';

const styles = StyleSheet.create({
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
    const { actions } = this.props;

    return (
      <View style={styles.container} scrollsToTop={false}>
        <View style={styles.iconList}>
          <NavButton name="md-home" onPress={() => this.narrowAndClose(homeNarrow())} />
          <NavButton name="md-mail" onPress={() => this.narrowAndClose(specialNarrow('private'))} />
          <NavButton name="md-star" onPress={() => this.narrowAndClose(specialNarrow('starred'))} />
          <NavButton name="md-at" onPress={() => this.narrowAndClose(specialNarrow('mentioned'))} />
          <NavButton name="md-search" onPress={actions.navigateToSearch} />
          <NavButton name="md-settings" onPress={actions.navigateToSettings} />
        </View>
        <StreamTabs screenProps={{ onNarrow: this.closeDrawer }} />
      </View>
    );
  }
}

export default connect(null, boundActions)(StreamSidebar);
