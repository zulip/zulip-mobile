import React, { Component } from 'react';

import { Popup } from '../common';
import Emoji from '../emoji/Emoji';

type Props = {
  ownEmail: string,
  users: any[],
  presence: Object,
};

export default class StreamAutocomplete extends Component {

  props: Props;

  handleSelect = (index: number) => {
  }

  render() {
    const streams = [];
    return (
      <Popup>
        {streams.map(x =>
          <Touchable key={x} onPress={this.handleSelect}>
            <View style={styles.emojiRow}>
              <Emoji name={x} size={15} />
              <Text>{x}</Text>
            </View>
          </Touchable>
        )}
      </Popup>
    );
  }
}
