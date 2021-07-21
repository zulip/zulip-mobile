/* @flow strict-local */
import React from 'react';
import { Image, View } from 'react-native';

import SpinningProgress from './SpinningProgress';
import { createStyleSheet } from '../styles';
import messageLoadingImg from '../../static/img/message-loading.png';

const styles = createStyleSheet({
  wrapper: {
    flex: 1,
    padding: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    alignSelf: 'center',
    overflow: 'hidden',
    position: 'absolute',
  },
});

type Props = $ReadOnly<{|
  color?: 'default' | 'black' | 'white',
  showLogo?: boolean,
  size?: number,
|}>;

/**
 * Renders a loading indicator - a faint circle and a bold
 * quarter of a circle spinning around it. Optionally,
 * a Zulip logo in the center.
 *
 * @prop [color] - The color of the circle.
 * @prop [showLogo] - Show or not a Zulip logo in the center.
 * @prop [size] - Diameter of the indicator in pixels.
 */
export default function LoadingIndicator(props: Props) {
  const { color = 'default', showLogo = false, size = 40 } = props;

  return (
    <View style={styles.wrapper}>
      <View>
        <SpinningProgress color={color} size={size} />
        {showLogo && (
          <Image
            style={[
              styles.logo,
              { width: (size / 3) * 2, height: (size / 3) * 2, marginTop: size / 6 },
            ]}
            source={messageLoadingImg}
            resizeMode="contain"
          />
        )}
      </View>
    </View>
  );
}
