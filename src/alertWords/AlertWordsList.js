/* @flow */
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { Label } from '../common';
import type { Auth, AlertWords } from '../types';
import AlertWordItem from './AlertWordItem';

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

export default class MuteTopicList extends PureComponent {
  props: {
    alertWords: AlertWords,
    auth: Auth,
  };

  render() {
    const { auth, alertWords } = this.props;

    if (alertWords === undefined) return null;

    if (alertWords.length === 0) {
      return (
        <View style={componentStyles.emptyView}>
          <Label style={componentStyles.text} text={'You have not added any alert word yet.'} />
        </View>
      );
    }

    return (
      <FlatList
        keyboardShouldPersistTaps="always"
        initialNumToRender={15}
        data={alertWords}
        keyExtractor={mutedTopic => mutedTopic}
        renderItem={({ item }) => <AlertWordItem auth={auth} alertWord={item} />}
      />
    );
  }
}
