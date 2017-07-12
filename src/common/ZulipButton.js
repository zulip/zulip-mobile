/* @flow */
import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { FormattedMessage } from 'react-intl';

import type { StyleObj } from '../types';
import { BRAND_COLOR } from '../styles';
import Touchable from './Touchable';
import Icon from '../common/Icons';

const styles = StyleSheet.create({
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  frame: {
    height: 44,
    justifyContent: 'center',
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 5,
  },
  primaryFrame: {
    backgroundColor: BRAND_COLOR,
  },
  secondaryFrame: {
    borderWidth: 1.5,
    borderColor: BRAND_COLOR,
  },
  touchTarget: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: BRAND_COLOR,
  },
  icon: {
    marginRight: 8,
  },
  primaryIcon: {
    color: 'white',
  },
  secondaryIcon: {
    color: BRAND_COLOR,
  },
});

const ButtonInProgress = ({ frameStyle }) =>
  <View style={frameStyle}>
    <ActivityIndicator color="white" />
  </View>;

const ButtonNormal = ({
  frameStyle,
  touchTargetStyle,
  textStyle,
  text,
  onPress,
  icon,
  iconStyle,
}) =>
  <View style={frameStyle}>
    <Touchable style={touchTargetStyle} onPress={onPress}>
      <View style={styles.buttonContent}>
        {icon && <Icon name={icon} style={iconStyle} size={25} />}
        <Text style={textStyle}>
          <FormattedMessage id={text} defaultMessage={text} />
        </Text>
      </View>
    </Touchable>
  </View>;

export default class ZulipButton extends React.PureComponent {
  props: {
    style?: StyleObj,
    progress?: boolean,
    text: string,
    icon?: string,
    secondary: boolean,
    onPress: () => void | Promise<any>,
  };

  static defaultProps: {
    secondary: false,
  };

  render() {
    const { style, text, secondary, progress, onPress, icon } = this.props;
    const frameStyle = [
      styles.frame,
      secondary ? styles.secondaryFrame : styles.primaryFrame,
      style,
    ];
    const textStyle = [styles.text, secondary ? styles.secondaryText : styles.primaryText];
    const iconStyle = [styles.icon, secondary ? styles.secondaryIcon : styles.primaryIcon];

    if (progress) {
      return <ButtonInProgress frameStyle={frameStyle} />;
    }

    return (
      <ButtonNormal
        frameStyle={frameStyle}
        touchTargetStyle={styles.touchTarget}
        text={text}
        onPress={onPress}
        textStyle={textStyle}
        icon={icon}
        iconStyle={iconStyle}
      />
    );
  }
}
