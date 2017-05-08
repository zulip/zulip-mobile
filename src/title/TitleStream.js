import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import StreamIcon from '../streamlist/StreamIcon';

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
    const { narrow, streams, subscriptions, color } = this.props;
    const stream = subscriptions.find(x => x.name === narrow[0].operand);

    const fontSize = narrow.length > 1 ? 14 : 16;
    const titleStyles = [styles.margin, { fontSize }, { color }];
    return (
      <View style={styles.wrapper}>
        <StreamIcon
          isMuted={stream && !stream.in_home_view}
          isPrivate={(streams.find(x => x.name === narrow[0].operand)).invite_only}
          color={color}
          size={fontSize}
        />
        <Text style={titleStyles}>
          {narrow[0].operand}
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
