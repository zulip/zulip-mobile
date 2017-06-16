import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import { Input } from '../../common';
import { isTopicNarrow } from '../../utils/narrow';
import styles from '../../styles';

const moreStyles = StyleSheet.create({
  streamInputWrapper: {
    flexDirection: 'row', alignItems: 'center', flex: 1
  }
});

export default class StreamBox extends Component {
  componentWillReceiveProps(nextProps) {
    if (this.props.narrow !== nextProps.narrow) {
      if (nextProps.narrow[0].operator !== 'pm-with') {
        const { setTopic } = this.props;
        if (isTopicNarrow(nextProps.narrow)) {
          setTopic(nextProps.narrow[1].operand);
        } else {
          setTopic(nextProps.lastTopic);
        }
      }
    }
  }

  render() {
    const { operator, setTopic } = this.props;
    return (
      <View style={moreStyles.streamInputWrapper}>
        <Input
          ref={component => { this.operandInput = component; }}
          style={styles.composeText}
          placeholder={'Topic'}
          onChange={(event) => setTopic(
            event.nativeEvent.text
          )}
          value={operator}
        />
      </View>
    );
  }
}
