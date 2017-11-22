/* @flow */
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import type { GlobalState } from '../types';
import connectWithActions from '../connectWithActions';
import { getTopicsInActiveNarrow } from '../selectors';
import { Popup, RawLabel, Touchable } from '../common';
import AnimatedScaleComponent from '../animation/AnimatedScaleComponent';

const styles = StyleSheet.create({
  topic: {
    padding: 10,
  },
});

type Props = {
  text: string,
  topics: string[],
  onAutocomplete: (name: string) => void,
};

class TopicAutocomplete extends PureComponent<Props> {
  props: Props;

  render() {
    const { topics, text, onAutocomplete } = this.props;

    if (text.length === 0) return null;
    const topicsToSuggest = topics.filter(
      x => x.topic !== text && x.topic.match(new RegExp(text, 'i')),
    );

    return (
      <AnimatedScaleComponent visible={topicsToSuggest.length > 0}>
        <Popup>
          <FlatList
            keyboardShouldPersistTaps="always"
            initialNumToRender={10}
            data={topicsToSuggest}
            keyExtractor={item => item.topic}
            renderItem={({ item }) => (
              <Touchable onPress={() => onAutocomplete(item.topic)}>
                <RawLabel style={styles.topic} text={item.topic} />
              </Touchable>
            )}
          />
        </Popup>
      </AnimatedScaleComponent>
    );
  }
}

export default connectWithActions((state: GlobalState) => ({
  topics: getTopicsInActiveNarrow(state),
}))(TopicAutocomplete);
