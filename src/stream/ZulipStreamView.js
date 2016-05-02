import React, {
  StyleSheet,
  ScrollView,
  View,
} from 'react-native';

import ZulipStreamMessageGroup from './ZulipStreamMessageGroup';
import ZulipStreamMessage from './ZulipStreamMessage';

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});

export default class ZulipStreamView extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.getLatestMessages();
  }

  render() {
    console.log(this.props.messages);
    return (
      <ScrollView
        style={styles.scrollView}
        automaticallyAdjustContentInset="false"
      >
        <View />
        <ZulipStreamMessageGroup
          stream={{ name: 'test', color: '#cef' }}
          thread="Hello there"
        >
          {this.props.messages.map((item) => (
            <ZulipStreamMessage
              key={item.id}
              from={item.sender_full_name}
              message={item.content}
              time={item.timestamp}
            />
          ))}
        </ZulipStreamMessageGroup>
      </ScrollView>
    );
  }
}
