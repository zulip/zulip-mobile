import React, {
  StyleSheet,
  ScrollView,
  View,
} from 'react-native';

import ZulipMessageGroupView from '../message/ZulipMessageGroupView';
import ZulipMessageView from '../message/ZulipMessageView';

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
        {this.props.messages.map((item) => {
          if (item.type === 'stream') {
            return (
              <ZulipMessageGroupView
                key={item.id}
                stream={{
                  name: item.display_recipient,
                  color: '#cef',
                }}
                thread={item.subject}
              >
                <ZulipMessageView
                  key={item.id}
                  from={item.sender_full_name}
                  message={item.content}
                  timestamp={item.timestamp}
                  avatar_url={item.avatar_url}
                />
              </ZulipMessageGroupView>
            );
          } else {
            return <View key={item.id} />
          }
        })}
      </ScrollView>
    );
  }
}
