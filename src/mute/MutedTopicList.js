/* @flow */
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import { Label } from '../common';
import type { Auth, GlobalState, MutedTopic } from '../types';
import { getAuth, getMute } from '../selectors';
import MutedTopicItem from './MutedTopicItem';

const componentStyles = StyleSheet.create({
  emptyView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
  },
});

class MuteTopicList extends PureComponent {
  props: {
    mute: MutedTopic,
    auth: Auth,
  };

  render() {
    const { auth, mute } = this.props;

    if (mute === undefined) return null;

    if (mute.length === 0) {
      return (
        <View style={componentStyles.emptyView}>
          <Label style={componentStyles.text} text={'You have not muted any topic yet.'} />
        </View>
      );
    }

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

export default connect((state: GlobalState) => ({
  auth: getAuth(state),
  mute: getMute(state),
}))(MuteTopicList);
