/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import Input from './Input';
import type { Props as InputProps } from './Input';
import { BRAND_COLOR, createStyleSheet } from '../styles';
import Label from './Label';
import Touchable from './Touchable';

const styles = createStyleSheet({
  showPasswordButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  showPasswordButtonText: {
    margin: 8,
    color: BRAND_COLOR,
  },
});

// Prettier wants a ", >" here, which is silly.
// prettier-ignore
type Props = $ReadOnly<$Diff<InputProps,
  // "mixed" here is a way of spelling "no matter *what* type
  // `InputProps` allows for these, don't allow them here."
  {| secureTextEntry: mixed, autoCorrect: mixed, autoCapitalize: mixed, _: mixed |}>>;

type State = {|
  isHidden: boolean,
|};

/**
 * A password input component using Input internally.
 * Provides a 'show'/'hide' button to show the password.
 *
 * All props are passed through to `Input`.  See `Input` for descriptions.
 */
export default class PasswordInput extends PureComponent<Props, State> {
  state = {
    isHidden: true,
  };

  handleShow = () => {
    this.setState(({ isHidden }) => ({
      isHidden: !isHidden,
    }));
  };

  render() {
    const { isHidden } = this.state;

    return (
      <View>
        <Input
          {...this.props}
          secureTextEntry={isHidden}
          autoCorrect={false}
          autoCapitalize="none"
        />
        <Touchable style={styles.showPasswordButton} onPress={this.handleShow}>
          <Label style={styles.showPasswordButtonText} text={isHidden ? 'show' : 'hide'} />
        </Touchable>
      </View>
    );
  }
}
