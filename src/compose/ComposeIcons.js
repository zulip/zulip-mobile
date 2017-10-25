/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Actions } from '../types';
import { IconPeople, IconSettings } from '../common/Icons';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
  },
});

type Props = {
  actions: Actions,
};

export default class ComposeIcon extends PureComponent<Props> {
  props: Props;

  render() {
    const { actions } = this.props;

    return (
      <View style={styles.wrapper}>
        <IconPeople size={24} onPress={actions.navigateToCreateGroup} />
        <IconSettings size={24} />
      </View>
    );
  }
}
