/* @flow strict-local */
import React from 'react';
import { create, act } from 'react-test-renderer';
import { TouchableNativeFeedback } from 'react-native';

import Touchable from '../Touchable';

describe('Touchable', () => {
  test('calls onLongPress', () => {
    const onLongPress = jest.fn();

    let renderer;
    act(() => {
      renderer = create(
        <Touchable onLongPress={onLongPress}>
          <></>
        </Touchable>,
      );
    });

    const touchable = renderer.root.findByType(TouchableNativeFeedback);

    act(() => {
      touchable.props.onLongPress();
    });

    expect(onLongPress).toHaveBeenCalledTimes(1);
  });
});
