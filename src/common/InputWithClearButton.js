/* @flow strict-local */
import React, { useRef, useState, useCallback } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import Input from './Input';
import type { Props as InputProps } from './Input';
import styles, { createStyleSheet, BRAND_COLOR } from '../styles';
import { Icon } from './Icons';

const componentStyles = createStyleSheet({
  clearButtonIcon: {
    color: BRAND_COLOR,
    paddingRight: 16,
  },
});

type Props = $ReadOnly<$Diff<InputProps, {| textInputRef: mixed, value: mixed, _: mixed |}>>;

/**
 * A component wrapping Input and providing an 'X' button
 * to clear the entered text.
 *
 * All props are passed through to `Input`.  See `Input` for descriptions.
 */
export default function InputWithClearButton(props: Props): Node {
  const { onChangeText } = props;

  const [text, setText] = useState<string>('');

  // We should replace the fixme with
  // `React$ElementRef<typeof TextInput>` when we can. Currently, that
  // would make `.current` be `any(implicit)`, which we don't want;
  // this is probably down to bugs in Flow's special support for React.
  const textInputRef = useRef<$FlowFixMe>();

  const handleChangeText = useCallback(
    (_text: string) => {
      setText(_text);
      if (onChangeText) {
        onChangeText(_text);
      }
    },
    [onChangeText],
  );

  const handleClear = useCallback(() => {
    handleChangeText('');
    if (textInputRef.current) {
      // `.current` is not type-checked; see definition.
      textInputRef.current.clear();
    }
  }, [handleChangeText]);

  return (
    <View style={styles.row}>
      <Input {...props} textInputRef={textInputRef} onChangeText={handleChangeText} value={text} />
      {text.length > 0 && (
        <Icon name="x" size={24} onPress={handleClear} style={componentStyles.clearButtonIcon} />
      )}
    </View>
  );
}
