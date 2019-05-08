/* @flow strict-local */

import React, { PureComponent } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import type { InjectedDispatch, Narrow } from '../types';
import { connect } from '../react-redux';
import { getTopicsForNarrow } from '../selectors';
import { Popup, RawLabel, Touchable } from '../common';
import AnimatedScaleComponent from '../animation/AnimatedScaleComponent';

const styles = StyleSheet.create({
  topic: {
    padding: 10,
  },
});

type OwnProps = {|
  isFocused: boolean,
  text: string,
  narrow: Narrow,
  onAutocomplete: (name: string) => void,
|};

type SelectorProps = {|
  topics: string[],
|};

type Props = {|
  ...InjectedDispatch,
  ...OwnProps,
  ...SelectorProps,
|};

class TopicAutocomplete extends PureComponent<Props> {
  render() {
    const { isFocused, topics, text, onAutocomplete } = this.props;

    if (!isFocused || text.length === 0) {
      return null;
    }

    const topicsToSuggest = topics.filter(
      x => x && x !== text && x.toLowerCase().indexOf(text.toLowerCase()) > -1,
    );

    return (
      <AnimatedScaleComponent visible={topicsToSuggest.length > 0}>
        <Popup>
          <FlatList
            keyboardShouldPersistTaps="always"
            initialNumToRender={10}
            data={topicsToSuggest}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <Touchable onPress={() => onAutocomplete(item)}>
                <RawLabel style={styles.topic} text={item} />
              </Touchable>
            )}
          />
        </Popup>
      </AnimatedScaleComponent>
    );
  }
}

export default connect((state, props: OwnProps): SelectorProps => ({
  topics: getTopicsForNarrow(props.narrow)(state),
}))(TopicAutocomplete);
