/* @flow strict-local */

import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import type { Dispatch, Narrow } from '../types';
import { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
import { getTopicsForNarrow } from '../selectors';
import { Popup, RawLabel, Touchable } from '../common';
import AnimatedScaleComponent from '../animation/AnimatedScaleComponent';
import { fetchTopicsForStream } from '../topics/topicActions';

const styles = createStyleSheet({
  topic: {
    padding: 10,
  },
});

type SelectorProps = $ReadOnly<{|
  topics: string[],
|}>;

type Props = $ReadOnly<{|
  narrow: Narrow,
  isFocused: boolean,
  text: string,
  onAutocomplete: (name: string) => void,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

class TopicAutocomplete extends PureComponent<Props> {
  componentDidMount() {
    const { dispatch, narrow } = this.props;
    // The following should be sufficient to ensure we're up-to-date
    // with the complete list of topics at all times that we need to
    // be:
    //
    // - When we first expect to see the list, fetch all topics for
    //   the stream.
    //
    // - Afterwards, update the list when a new message arrives, if it
    //   introduces a new topic.
    //
    // The latter is already taken care of (see handling of
    // EVENT_NEW_MESSAGE in topicsReducer). So, do the former here.
    dispatch(fetchTopicsForStream(narrow));
  }

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
            nestedScrollEnabled
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

export default connect<SelectorProps, _, _>((state, props) => ({
  topics: getTopicsForNarrow(state, props.narrow),
}))(TopicAutocomplete);
