/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View } from 'react-native';
import Popover, { PopoverPlacement, PopoverMode } from 'react-native-popover-view';
import type { EmojiType } from '../types';
import { createStyleSheet, BRAND_COLOR } from '../styles';
import Emoji from './Emoji';
import { RawLabel, Touchable } from '../common';

type Props = $ReadOnly<{|
  type: EmojiType,
  code: string,
  name: string,
  onPress: (name: string) => void,
|}>;
type State = {|
  showPopOver: boolean,
|};

const styles = createStyleSheet({
  emojiRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  toolTiptext: {
    paddingLeft: 6,
    color: BRAND_COLOR,
  },
});
export default class EmojiWithTooltip extends PureComponent<Props, State> {
  state = { showPopOver: false };

  handlePress = () => {
    const { name, onPress } = this.props;
    onPress(name);
  };
  handleLongPress = () => {
    this.setState({ showPopOver: true });
  };
  removePopOver = () => {
    if (this.state.showPopOver) {
      this.setState({ showPopOver: false });
    }
  };

  render() {
    const { code, name, type } = this.props;
    const { showPopOver } = this.state;

    return (
      <Popover
        mode={PopoverMode.TOOLTIP}
        placement={PopoverPlacement.TOP}
        isVisible={showPopOver}
        from={(
          <Touchable
            onPress={this.handlePress}
            onLongPress={this.handleLongPress}
            onPressOut={this.removePopOver}
          >
            <View style={{ padding: 12 }}>
              <Emoji code={code} type={type} />
            </View>
          </Touchable>
        )}
      >
        <View style={styles.emojiRow}>
          <Emoji code={code} type={type} />
          <RawLabel style={styles.toolTiptext} text={name} />
        </View>
      </Popover>
    );
  }
}
