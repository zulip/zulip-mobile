import React from 'react';
import { FlatList, Button, StyleSheet } from 'react-native';

import Icon from '../../common/Icons';
import { BORDER_COLOR } from '../../styles';
import FORMATS from './FORMATS';

const componentStyles = StyleSheet.create({
  inlinePadding: {
    padding: 8,
  },
  flatList: {
    backgroundColor: 'rgba(127, 127, 127, 0.1)',
  },
});

const renderButton = ({ item, getState, setState }) =>
  item.icon ? (
    <Icon
      name={item.icon}
      onPress={() => item.onPress({ getState, setState, item })}
      size={24}
      style={componentStyles.inlinePadding}
      color={BORDER_COLOR}
    />
  ) : (
    <Button
      title={item.key}
      onPress={() => item.onPress({ getState, setState, item })}
      color={BORDER_COLOR}
      style={componentStyles.inlinePadding}
    />
  );

export const renderFormatButtons = ({ getState, setState }) => {
  const list = (
    <FlatList
      data={FORMATS}
      keyboardShouldPersistTaps="always"
      renderItem={({ item, index }) => renderButton({ item, getState, setState })}
      horizontal
      style={componentStyles.flatList}
    />
  );
  return list;
};
