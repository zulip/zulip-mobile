/* @flow strict-local */

import React, { useEffect } from 'react';
import { FlatList } from 'react-native';

import type { Narrow } from '../types';
import { createStyleSheet } from '../styles';
import { useDispatch, useSelector } from '../react-redux';
import { getTopicsForNarrow } from '../selectors';
import { Popup, RawLabel, Touchable } from '../common';
import AnimatedScaleComponent from '../animation/AnimatedScaleComponent';
import { fetchTopicsForStream } from '../topics/topicActions';

const styles = createStyleSheet({
  topic: {
    padding: 10,
  },
});

type Props = $ReadOnly<{|
  narrow: Narrow,
  isFocused: boolean,
  text: string,
  onAutocomplete: (name: string) => void,
|}>;

export default function TopicAutocomplete(props: Props) {
  const { narrow, isFocused, text, onAutocomplete } = props;
  const dispatch = useDispatch();
  const topics = useSelector(state => getTopicsForNarrow(state, narrow));

  useEffect(() => {
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
  }, [dispatch, narrow]);

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
