import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { foregroundColorFromBackground } from '../utils/color';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
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
    const { narrow, subscriptions, color } = this.props;
    const stream = subscriptions.find(x => x.name === narrow[0].operand);
    const iconType = stream.invite_only ? 'lock' : 'hashtag';
    const textColor = foregroundColorFromBackground(color);
    return (
      <View style={styles.wrapper}>
        <Icon
          name={iconType}
          color={textColor}
          size={16}
        />
        <Text style={[styles.title, { color: textColor }]}>
          {stream.name}
        </Text>
        {narrow.length > 1 &&
          <Text style={styles.title}>
            &gt; {narrow[1].operand}
          </Text>
        }
      </View>
    );
  }
}
