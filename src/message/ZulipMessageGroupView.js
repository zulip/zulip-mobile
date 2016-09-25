import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import {
  privateNarrow,
  streamNarrow,
  topicNarrow,
} from '../lib/narrow.js';

const DEFAULT_PADDING = 8;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },
  stream: {
    backgroundColor: '#cec',
    padding: DEFAULT_PADDING,
    fontSize: 16,
  },
  topic: {
    padding: DEFAULT_PADDING,
    fontSize: 16,
  },
  private: {
    flex: 1,
    backgroundColor: '#333',
    color: '#fff',
  },
});

export class ZulipPrivateMessageHeader extends React.Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const others = this.props.recipients.map(r => r.full_name).sort().join(', ');
    const title = others ? `You and ${others}` : 'Just You';

    return (
      <View style={styles.header}>
        <Text
          style={[styles.stream, styles.private]}
          onPress={() => this.props.narrow(
            privateNarrow(this.props.recipients.map(r => r.email)),
            this.props.item.id,
            [this.props.item]
          )}
        >
          {title}
        </Text>
      </View>
    );
  }
};

export class ZulipStreamMessageHeader extends React.Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    return (
      <View style={styles.header}>
        <Text
          style={[styles.stream, { backgroundColor: this.props.color }]}
          onPress={() => this.props.narrow(
            streamNarrow(this.props.stream),
            this.props.item.id,
            [this.props.item]
          )}
        >
          {this.props.stream}
        </Text>
        <Text
          style={styles.topic}
          onPress={() => this.props.narrow(
            topicNarrow(this.props.stream, this.props.topic),
            this.props.item.id,
            [this.props.item]
          )}
        >
          {this.props.topic}
        </Text>
      </View>
    );
  }
};
