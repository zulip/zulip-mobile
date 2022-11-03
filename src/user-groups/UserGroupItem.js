/* @flow strict-local */
import React, { useCallback, useContext, useMemo } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import { IconPeople } from '../common/Icons';
import ZulipText from '../common/ZulipText';
import Touchable from '../common/Touchable';
import { createStyleSheet, ThemeContext } from '../styles';

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

  const styles = useMemo(
    () => ({
      wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
      },
    }),
    [],
  );

  return (
    <Touchable onPress={handlePress}>
      <View style={styles.wrapper}>
        <IconPeople size={32} color={themeContext.color} />
        <View style={componentStyles.textWrapper}>
          <ZulipText
            style={componentStyles.text}
            text={name}
            numberOfLines={1}
            ellipsizeMode="tail"
          />
          <ZulipText
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
