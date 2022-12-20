/* @flow strict-local */
import React, { useState, useCallback } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import Input from './Input';
import type { Props as InputProps } from './Input';
import { BORDER_COLOR, BRAND_COLOR, createStyleSheet } from '../styles';
import ZulipTextIntl from './ZulipTextIntl';
import Touchable from './Touchable';

const styles = createStyleSheet({
  showPasswordButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    borderTopWidth: 1,
    borderColor: BORDER_COLOR,
    borderBottomWidth: 1,
    borderRightWidth: 1

  },
  showPasswordButtonText: {
    margin: 8,
    color: BRAND_COLOR,
  },
  passwordTextInput: {
    width: '87.5%',
    borderRightWidth: 0,
  }
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
  const [isHidden, setIsHidden] = useState<boolean>(true);

  const handleShow = useCallback(() => {
    setIsHidden(prevIsHidden => !prevIsHidden);
  }, []);

  return (
    <View style={{
      width: '100%'
    }}
    >
      <Input
        {...props}
        secureTextEntry={isHidden}
        autoCorrect={false}
        autoCapitalize="none"
        style={styles.passwordTextInput}
      />
      <Touchable style={styles.showPasswordButton} onPress={handleShow}>
        <ZulipTextIntl style={styles.showPasswordButtonText} text={isHidden ? 'show' : 'hide'} />
      </Touchable>
    </View>
  );
}
