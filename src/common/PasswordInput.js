/* @flow strict-local */
import React, { useState, useCallback } from 'react';
import type { Node } from 'react';
import { View, Pressable } from 'react-native';

import { Icon } from './Icons';
import Input from './Input';
import type { Props as InputProps } from './Input';
import { BRAND_COLOR, HIGHLIGHT_COLOR, createStyleSheet } from '../styles';
import { TranslationContext } from '../boot/TranslationProvider';

const styles = createStyleSheet({
  showPasswordButton: {
    marginLeft: 8,
  },
  passwordTextInput: {
    flex: 1,
  },
  passwordInputView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

// Prettier wants a ", >" here, which is silly.
// prettier-ignore
type Props = $ReadOnly<$Diff<InputProps,
  // "mixed" here is a way of spelling "no matter *what* type
  // `InputProps` allows for these, don't allow them here."
  {| secureTextEntry: mixed, autoCorrect: mixed, autoCapitalize: mixed, _: mixed |}>>;

/**
 * A password input component using Input internally.
 * Provides a 'show'/'hide' button to show the password.
 *
 * All props are passed through to `Input`.  See `Input` for descriptions.
 */
export default function PasswordInput(props: Props): Node {
  const _ = React.useContext(TranslationContext);

  const [isHidden, setIsHidden] = useState<boolean>(true);

  const handleShow = useCallback(() => {
    setIsHidden(prevIsHidden => !prevIsHidden);
  }, []);

  return (
    <View style={styles.passwordInputView}>
      <Input
        {...props}
        secureTextEntry={isHidden}
        autoCorrect={false}
        autoCapitalize="none"
        style={styles.passwordTextInput}
      />
      <Pressable
        // 24 (icon size) + 12 + 12 = 48px min touch target:
        //   https://material.io/design/usability/accessibility.html#layout-and-typography
        hitSlop={12}
        style={styles.showPasswordButton}
        onPress={handleShow}
        accessibilityLabel={_('Show password')}
        accessibilityRole="switch"
        accessibilityState={{ checked: !isHidden }}
      >
        {({ pressed }) => (
          <Icon
            color={pressed ? HIGHLIGHT_COLOR : BRAND_COLOR}
            name={isHidden ? 'eye-off' : 'eye'}
            size={24}
          />
        )}
      </Pressable>
    </View>
  );
}
