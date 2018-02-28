/* @flow */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import type { Auth, MutedTopic } from '../types';
import MutedTopicItem from './MutedTopicItem';

type Props = {
  mute: MutedTopic,
  auth: Auth,
};

export default class MuteTopicList extends PureComponent<Props> {
  props: Props;

  render() {
    const { auth, mute } = this.props;

    return (
      <FlatList
        keyboardShouldPersistTaps="always"
        initialNumToRender={15}
        data={mute}
        keyExtractor={mutedTopic => mutedTopic}
        renderItem={({ item }) => <MutedTopicItem auth={auth} mutedTopic={item} />}
      />
    );
  }
}
