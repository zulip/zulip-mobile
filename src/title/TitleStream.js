import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  margin: {
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

    const fontSize = narrow.length > 1 ? 14 : 16;
    const titleStyles = [styles.margin, { fontSize }, { color }];

    return (
      <View style={styles.wrapper}>
        <Icon
          name={iconType}
          color={color}
          size={fontSize}
        />
        <Text style={titleStyles}>
          {stream.name}
        </Text>
        {narrow.length > 1 &&
          <Text style={titleStyles}>
            {'\u203a'} {narrow[1].operand}
          </Text>
        }
      </View>
    );
  }
}
