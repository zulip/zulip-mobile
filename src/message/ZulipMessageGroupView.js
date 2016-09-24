import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import PureRenderMixin from 'react-addons-pure-render-mixin';

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
  },
  topic: {
    padding: DEFAULT_PADDING,
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
    const others = this.props.recipients.sort().join(', ');
    const title = others ? `You and ${others}` : 'Just You';

    return (
      <View style={styles.header}>
        <Text style={[styles.stream, styles.private]}>
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
        <Text style={[styles.stream, { backgroundColor: this.props.color }]}>
          {this.props.stream}
        </Text>
        <Text style={styles.topic}>
          {this.props.topic}
        </Text>
      </View>
    );
  }
};
