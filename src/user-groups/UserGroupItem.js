/* @flow strict-local */
import React, { useCallback, useContext } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import { IconPeople } from '../common/Icons';
import { RawLabel, Touchable } from '../common';
import styles, { createStyleSheet, ThemeContext } from '../styles';

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

export default function UserGroupItem(props: Props): Node {
  const { name, description, onPress } = props;

  const handlePress = useCallback(() => {
    onPress(name);
  }, [onPress, name]);

  const themeContext = useContext(ThemeContext);

  return (
    <Touchable onPress={handlePress}>
      <View style={styles.listItem}>
        <IconPeople size={32} color={themeContext.color} />
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
