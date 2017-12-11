/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import { Label, Screen } from '../common';
import type { Auth, MutedTopic } from '../types';
import MutedTopicList from './MutedTopicList';

const componentStyles = StyleSheet.create({
  text: {
    alignSelf: 'center',
  },
});

type Props = {
  mute: MutedTopic,
  auth: Auth,
};

export default class MutedTopicScreen extends PureComponent<Props> {
  props: Props;

  render() {
    const { auth, mute } = this.props;

    return (
      <Screen title="Muted topics">
        {mute === undefined || mute.length === 0 ? (
          <Label style={componentStyles.text} text="You have not muted any topic yet." />
        ) : (
          <MutedTopicList auth={auth} mute={mute} />
        )}
      </Screen>
    );
  }
}
