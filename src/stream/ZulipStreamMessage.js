import React, {
  StyleSheet,
  View,
  Text,
} from 'react-native';

const DEFAULT_PADDING = 8;

const styles = StyleSheet.create({
  message: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: DEFAULT_PADDING,
  },
  messageContent: {
    flex: 1,
    flexDirection: 'column',
  },
  messageHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  messageUser: {
    fontWeight: 'bold',
  },
  messageTime: {
    color: '#999',
    fontSize: 11,
  },
  messageText: {
    textAlign: 'left',
  },
  messageThumbnail: {
    backgroundColor: '#ccc',
    width: 34,
    height: 34,
    marginRight: DEFAULT_PADDING * 2,
    borderRadius: 2,
  },
});

const ZulipStreamMessage = (props) => (
  <View style={styles.message}>
    <View style={styles.messageThumbnail}>
      <View />
    </View>
    <View style={styles.messageContent}>
      <View style={styles.messageHeader}>
        <Text style={styles.messageUser}>
          {props.from}
        </Text>
        <Text style={styles.messageTime}>
          {props.time}
        </Text>
      </View>
      <Text style={styles.messageText}>
        {props.message}
      </Text>
    </View>
  </View>
);

ZulipStreamMessage.propTypes = {
  from: React.PropTypes.string.isRequired,
  time: React.PropTypes.number.isRequired,
  message: React.PropTypes.string.isRequired,
};

export default ZulipStreamMessage;
