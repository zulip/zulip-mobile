/* @flow strict-local */
import React from 'react';
import { View, FlatList } from 'react-native';

import type { RouteProp } from '../react-navigation';
import { useSelector, useDispatch } from '../react-redux';
import { getSettings } from '../selectors';
import '../boot/AppEventHandlers';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { settingsChange } from '../actions';
import { Screen, Touchable, OptionDivider, Label } from '../common';
import { IconDone } from '../common/Icons';
import { createStyleSheet, BRAND_COLOR, ThemeContext } from '../styles';

const styles = createStyleSheet({
  listWrapper: {
    flex: 1,
    flexDirection: 'column',
  },
  name: {
    fontWeight: '300',
    fontSize: 13,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 16,
  },
});

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'theme'>,
  route: RouteProp<'theme', void>,
|}>;

const themeData = [
  {
    name: 'System Default',
    value: 'automatic',
  },
  {
    name: 'Dark',
    value: 'night',
  },
  {
    name: 'Light',
    value: 'default',
  },
];

export default function ThemeScreen(props: Props) {
  const dispatch = useDispatch();
  const theme = useSelector(state => getSettings(state).theme);
  const { color } = React.useContext(ThemeContext);

  const handleThemeChange = item => {
    dispatch(settingsChange({ theme: item.value }));
  };

  return (
    <Screen title="Theme">
      <FlatList
        ItemSeparatorComponent={OptionDivider}
        data={themeData}
        renderItem={({ item }) => (
          <Touchable onPress={() => handleThemeChange(item)}>
            <View style={styles.listItem}>
              <View style={styles.listWrapper}>
                <Label text={item.name} style={{ color }} />
              </View>
              <View>{theme === item.value && <IconDone size={16} color={BRAND_COLOR} />}</View>
            </View>
          </Touchable>
        )}
      />
    </Screen>
  );
}
