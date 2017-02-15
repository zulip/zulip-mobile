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
    const { narrow, subscriptions, textColor } = this.props;
    const stream = subscriptions.find(x => x.name === narrow[0].operand);
    const iconType = stream.invite_only ? 'lock' : 'hashtag';

    const fontSize = narrow.length > 1 ? 14 : 16;
    let titleStyles = [styles.margin];
    titleStyles.push({ fontSize });
    titleStyles.push({ color: textColor });

    console.log(narrow);
    return (
      <View style={styles.wrapper}>
        <Icon
          name={iconType}
          color={textColor}
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
