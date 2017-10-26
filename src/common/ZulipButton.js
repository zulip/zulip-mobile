/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { FormattedMessage } from 'react-intl';

import type { StyleObj } from '../types';
import { BRAND_COLOR } from '../styles';
import Touchable from './Touchable';

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
    borderRadius: 22,
    overflow: 'hidden',
  },
  primaryFrame: {
    backgroundColor: BRAND_COLOR,
  },
  secondaryFrame: {
    borderWidth: 1.5,
    borderColor: BRAND_COLOR,
  },
  fullSizeFrame: {
    backgroundColor: BRAND_COLOR,
    borderRadius: 0,
    flex: 1,
  },
  touchTarget: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
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

const ButtonInProgress = ({ frameStyle }) => (
  <View style={frameStyle}>
    <ActivityIndicator color="white" />
  </View>
);

const ButtonNormal = ({
  frameStyle,
  touchTargetStyle,
  textStyle,
  text,
  onPress,
  Icon,
  iconStyle,
}) => (
  <View style={frameStyle}>
    <Touchable style={touchTargetStyle} onPress={onPress}>
      <View style={styles.buttonContent}>
        {Icon && <Icon style={iconStyle} size={25} />}
        <Text style={textStyle}>
          <FormattedMessage id={text} defaultMessage={text} />
        </Text>
      </View>
    </Touchable>
  </View>
);

type Props = {
  style?: StyleObj,
  progress?: boolean,
  Icon?: Object,
  text: string,
  secondary: boolean,
  fullSize: boolean,
  onPress: () => void | Promise<any>,
};

export default class ZulipButton extends PureComponent<Props> {
  props: Props;

  static defaultProps = {
    secondary: false,
    fullSize: false,
  };

  render() {
    const { style, text, secondary, progress, fullSize, onPress, Icon } = this.props;
    const frameStyle = [
      styles.frame,
      secondary ? styles.secondaryFrame : styles.primaryFrame,
      fullSize && styles.fullSizeFrame,
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
        Icon={Icon}
        iconStyle={iconStyle}
      />
    );
  }
}
