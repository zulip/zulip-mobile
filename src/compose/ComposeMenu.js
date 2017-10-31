/* @flow */
import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Actions } from '../types';
import { BRAND_COLOR } from '../styles';
import { Touchable } from '../common';
import { IconPlus, IconLeft, IconPeople, IconImage, IconCamera } from '../common/Icons';
import AnimatedComponent from '../animation/AnimatedComponent';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  touchable: {},
  button: {
    padding: 10,
    color: BRAND_COLOR,
  },
});

type Props = {
  actions: Actions,
};

type State = {
  expanded: boolean,
};

export default class ComposeMenu extends Component<Props, State> {
  props: Props;
  state: State;

  state = {
    expanded: false,
  };

  handleExpandContract = () => {
    this.setState(({ expanded }) => ({
      expanded: !expanded,
    }));
  };

  render() {
    const { expanded } = this.state;
    const { actions } = this.props;

    return (
      <View style={styles.wrapper}>
        <AnimatedComponent property="width" useNativeDriver={false} visible={expanded} width={124}>
          <View style={styles.wrapper}>
            <IconPeople style={styles.button} size={24} onPress={actions.navigateToCreateGroup} />
            <IconImage style={styles.button} size={24} />
            <IconCamera style={styles.button} size={24} />
          </View>
        </AnimatedComponent>
        <Touchable style={styles.touchable} onPress={this.handleExpandContract}>
          {!expanded && <IconPlus style={styles.button} size={24} />}
          {expanded && <IconLeft style={styles.button} size={24} />}
        </Touchable>
      </View>
    );
  }
}
