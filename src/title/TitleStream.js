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
  title: {
    color: 'white',
    fontSize: 16,
    marginLeft: 4,
  },
});

export default class TitleStream extends React.PureComponent {

  props: {
    subscriptions: [],
    narrow: () => {},
  }

  render() {
    const { narrow, subscriptions } = this.props;
    const stream = subscriptions.find(x => x.name === narrow[0].operand);
    const iconType = stream.invite_only ? 'md-lock' : 'md-chatbubbles';

    return (
      <View style={styles.wrapper}>
        <Icon
          name={iconType}
          color="white"
          size={16}
        />
        <Text style={styles.title}>
          {stream.name}
        </Text>
      </View>
    );
  }
}
