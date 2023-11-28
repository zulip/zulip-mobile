/* @flow strict-local */
// $FlowFixMe[untyped-import]
import Color from 'color';
import * as React from 'react';
import { View } from 'react-native';
import invariant from 'invariant';

import { useGlobalSelector } from '../react-redux';
import { getGlobalSettings } from '../directSelectors';
import type { LocalizableText, LocalizableReactText } from '../types';
import { showErrorAlert } from '../utils/info';
import { TranslationContext } from '../boot/TranslationProvider';
import ZulipTextIntl from './ZulipTextIntl';
import Touchable from './Touchable';
import type { SpecificIconType } from './Icons';
import { ThemeContext, createStyleSheet } from '../styles';

type Props = $ReadOnly<{|
  icon?: {|
    +Component: SpecificIconType,
    +color?: string,
  |},

  title: LocalizableReactText,
  subtitle?: LocalizableReactText,

  onPress?: () => void | Promise<void>,

  disabled?:
    | {|
        +title: LocalizableText,
        +message?: LocalizableText,
        +learnMoreButton?: {|
          +url: URL,
          +text?: LocalizableText,
        |},
      |}
    | false,
|}>;

/**
 * A row with a title, and optional icon, subtitle, and press handler.
 *
 * See also NavRow, SwitchRow, etc.
 */
export default function TextRow(props: Props): React.Node {
  const { title, subtitle, onPress, icon, disabled } = props;

  const globalSettings = useGlobalSelector(getGlobalSettings);

  const _ = React.useContext(TranslationContext);
  const themeContext = React.useContext(ThemeContext);

  const fadeColorIfDisabled = React.useCallback(
    (color: string) =>
      typeof disabled === 'object' ? (Color(color).fade(0.5).toString(): string) : color,
    [disabled],
  );

  const styles = React.useMemo(
    () =>
      createStyleSheet({
        container: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 8,
          paddingHorizontal: 16,

          // Minimum touch target height (and width):
          //   https://material.io/design/usability/accessibility.html#layout-and-typography
          minHeight: 48,
        },
        icon: {
          textAlign: 'center',
          marginRight: 8,
          color: fadeColorIfDisabled(icon?.color ?? themeContext.color),
        },
        textWrapper: {
          flex: 1,
        },
        title: {
          color: fadeColorIfDisabled(themeContext.color),
        },
        subtitle: {
          fontWeight: '300',
          fontSize: 13,
          color: fadeColorIfDisabled(themeContext.color),
        },
      }),
    [themeContext, icon, fadeColorIfDisabled],
  );

  const content = (
    <View style={styles.container}>
      {!!icon && <icon.Component size={24} style={styles.icon} />}
      <View style={styles.textWrapper}>
        <ZulipTextIntl style={styles.title} text={title} />
        {subtitle !== undefined && <ZulipTextIntl style={styles.subtitle} text={subtitle} />}
      </View>
    </View>
  );

  const hasTouchResponse = onPress != null || typeof disabled === 'object';

  const effectiveOnPress = React.useCallback(() => {
    invariant(
      hasTouchResponse,
      'effectiveOnPress should only be called when hasTouchResponse is true',
    );

    if (disabled) {
      const { title, message, learnMoreButton } = disabled; // eslint-disable-line no-shadow
      showErrorAlert(
        _(title),
        message != null ? _(message) : undefined,
        learnMoreButton && {
          url: learnMoreButton.url,
          text: learnMoreButton.text != null ? _(learnMoreButton.text) : undefined,
          globalSettings,
        },
      );
      return;
    }

    invariant(onPress != null, 'onPress should be true because hasTouchResponse is true');
    onPress();
  }, [_, disabled, globalSettings, onPress, hasTouchResponse]);

  return hasTouchResponse ? <Touchable onPress={effectiveOnPress}>{content}</Touchable> : content;
}
