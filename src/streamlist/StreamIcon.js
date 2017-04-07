import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialIcons';

export default ({color, style, isPrivate, isMuted, size}) =>
  isMuted
    ? <Icon2 name="volume-off" size={size} color={color} style={style} />
    : <Icon
        name={isPrivate ? 'lock' : 'hashtag'}
        size={size}
        color={color}
        style={style}
      />;
