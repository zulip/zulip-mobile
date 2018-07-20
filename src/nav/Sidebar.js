/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { Context, Dispatch } from '../types';
import { homeNarrow, specialNarrow } from '../utils/narrow';
import { doNarrow, navigateToSearch } from '../actions';
import { OptionButton } from '../common';
import { IconHome, IconStar, IconMention, IconSettings } from '../common/Icons';
import { navigateToSettings } from './navActions';

const componentStyles = StyleSheet.create({
  rowList: {
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
});

type Props = {
  dispatch: Dispatch,
};

class Sidebar extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { dispatch } = this.props;

    return (
      <View>
        <View style={componentStyles.rowList}>
          <OptionButton
            Icon={IconHome}
            label="All messages"
            onPress={() => {
              dispatch(doNarrow(homeNarrow));
            }}
          />
          <OptionButton
            Icon={IconStar}
            label="Starred messages"
            onPress={() => {
              dispatch(doNarrow(specialNarrow('starred')));
            }}
          />
          <OptionButton
            Icon={IconMention}
            label="Mentions"
            onPress={() => {
              dispatch(doNarrow(specialNarrow('mentioned')));
            }}
          />
          <OptionButton
            Icon={IconSettings}
            label="Settings"
            onPress={() => {
              dispatch(navigateToSettings());
            }}
          />
        </View>
      </View>
    );
  }
}

export default connect()(Sidebar);
