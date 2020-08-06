/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import { IconPeople } from '../common/Icons';
import { RawLabel, Touchable } from '../common';
import styles, { createStyleSheet, ThemeContext } from '../styles';
import type { ThemeData } from '../styles';

const componentStyles = createStyleSheet({
  text: {
    marginLeft: 8,
  },
  textEmail: {
    fontSize: 10,
    color: 'hsl(0, 0%, 60%)',
  },
  textWrapper: {
    flex: 1,
  },
});

type Props = $ReadOnly<{|
  name: string,
  description: string,
  onPress: (name: string) => void,
|}>;

export default class UserGroupItem extends PureComponent<Props> {
  static contextType = ThemeContext;
  context: ThemeData;

  handlePress = () => {
    const { name, onPress } = this.props;
    onPress(name);
  };

  render() {
    const { name, description } = this.props;

    return (
      <Touchable onPress={this.handlePress}>
        <View style={styles.listItem}>
          <IconPeople size={32} color={this.context.color} />
          <View style={componentStyles.textWrapper}>
            <RawLabel
              style={componentStyles.text}
              text={name}
              numberOfLines={1}
              ellipsizeMode="tail"
            />
            <RawLabel
              style={[componentStyles.text, componentStyles.textEmail]}
              text={description}
              numberOfLines={1}
              ellipsizeMode="tail"
            />
          </View>
        </View>
      </Touchable>
    );
  }
}
