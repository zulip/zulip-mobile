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
  },
  title: {
    color: 'white',
    fontSize: 16,
    // lineHeight: NAVBAR_HEIGHT,
  },
});

export default class TitleStream extends React.PureComponent {

  props: {
    stream: string,
    isPrivate: boolean,
  }

  render() {
    const { stream, isPrivate } = this.props;
    const iconType = isPrivate ? 'md-lock' : 'md-chatbubbles';

    return (
      <View style={styles.wrapper}>
        <Icon
          name={iconType}
          // color={textColor}
          size={16}
          style={styles.icon}
        />
        <Text
          style={styles.stream}
        >
          {stream}
        </Text>
      </View>
    );
  }
}
