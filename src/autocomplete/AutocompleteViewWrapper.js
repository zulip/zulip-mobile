/* @flow */
import React, { PureComponent } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import type { InputSelectionType, Narrow } from '../types';
import AutocompleteView from './AutocompleteView';
import TopicAutocomplete from './TopicAutocomplete';

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    justifyContent: 'flex-end',
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
  props: Props;

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
    const { height } = Dimensions.get('window');

    return (
      <View style={[styles.wrapper, { height: height / 2 - marginBottom, marginBottom }]}>
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
