import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streamTitle: {
    color: 'white',
    paddingLeft: 8,
    fontSize: 16,
  },
});

export default class TitleStream extends React.PureComponent {

  props: {
    stream: string,
    isPrivate: boolean,
  }

  render() {
    const { narrow } = this.props;
    const { stream, isPrivate } = this.props;
    const iconType = isPrivate ? 'md-lock' : 'md-chatbubbles';

    return (
      <View style={styles.wrapper}>
        <Icon
          name={iconType}
          color="white"
          size={16}
        />
        <Text
          style={styles.streamTitle}
        >
          {narrow[0].operand}
        </Text>
      </View>
    );
  }
}
