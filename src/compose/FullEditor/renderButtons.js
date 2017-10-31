import React from 'react';
import { FlatList, Button } from 'react-native';

import Icon from '../../common/Icons';
import { BORDER_COLOR } from '../../styles';
import FORMATS from './FORMATS';

const inlinePadding = { padding: 8 };

const renderButton = ({ item, getState, setState }) =>
  item.icon ? (
    <Icon
      name={item.icon}
      onPress={() => item.onPress({ getState, setState, item })}
      size={28}
      style={inlinePadding}
      color={BORDER_COLOR}
    />
  ) : (
    <Button
      title={item.key}
      onPress={() => item.onPress({ getState, setState, item })}
      color={BORDER_COLOR}
      style={inlinePadding}
    />
  );

export const renderFormatButtons = ({ getState, setState }) => {
  const list = (
    <FlatList
      data={FORMATS}
      keyboardShouldPersistTaps="always"
      renderItem={({ item, index }) => renderButton({ item, getState, setState })}
      horizontal
    />
  );
  return list;
};
