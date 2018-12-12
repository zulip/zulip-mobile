/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { InputSelectionType, Narrow } from '../types';
import AutocompleteView from './AutocompleteView';
import TopicAutocomplete from './TopicAutocomplete';

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});

type Props = {
  composeText: string,
  isTopicFocused: boolean,
  marginBottom: number,
  messageSelection: InputSelectionType,
  narrow: Narrow,
  topicText: string,
  onMessageAutocomplete: (message: string) => void,
  onTopicAutocomplete: (topic: string) => void,
};

export default class AutocompleteViewWrapper extends PureComponent<Props> {
  render() {
    const {
      composeText,
      isTopicFocused,
      marginBottom,
      messageSelection,
      narrow,
      topicText,
      onMessageAutocomplete,
      onTopicAutocomplete,
    } = this.props;
    return (
      <View style={[styles.wrapper, { marginBottom }]}>
        <TopicAutocomplete
          isFocused={isTopicFocused}
          narrow={narrow}
          text={topicText}
          onAutocomplete={onTopicAutocomplete}
        />
        <AutocompleteView
          selection={messageSelection}
          text={composeText}
          onAutocomplete={onMessageAutocomplete}
        />
      </View>
    );
  }
}
