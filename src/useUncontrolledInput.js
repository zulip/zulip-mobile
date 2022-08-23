/* @flow strict-local */
/* eslint-disable no-shadow */

import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { TextInput } from 'react-native';
import type { SelectionChangeEvent } from 'react-native/Libraries/Components/TextInput/TextInput';

import { usePrevious } from './reactUtils';

type InputState = {| +value: string, +selection: {| +start: number, +end: number |} |};

/**
 * State management for an Input component that doesn't get passed `value`
 *   or `selection`, i.e., an uncontrolled Input.
 *
 * For background on the concept, see
 *   https://reactjs.org/docs/uncontrolled-components.html
 * and our #2738 for the performance concerns that led us to use this in the
 * compose box.
 *
 * Returns:
 * - A ref to use for the TextInput
 * - The value and selection state
 * - Functions to set the value and selection
 * - Two callbacks that should be passed directly to the TextInput as props:
 *   onChangeText, onSelectionChange.
 */
export default (initialState: {|
  +value?: InputState['value'],
  +selection?: InputState['selection'],
|}): ([
  {| current: React$ElementRef<typeof TextInput> | null |},
  InputState,
  ((InputState => InputState['value']) | InputState['value']) => void,
  ((InputState => InputState['selection']) | InputState['selection']) => void,
  {|
    +onChangeText: string => void,
    +onSelectionChange: SelectionChangeEvent => void,
  |},
]) => {
  const ref = useRef<React$ElementRef<typeof TextInput> | null>(null);

  const [state, setState] = useState<InputState>({
    value: '', // default value
    selection: { start: 0, end: 0 }, // default value
    ...initialState,
  });

  const setValueWasCalled = useRef<boolean>(false);
  const setValue = useCallback(updater => {
    setValueWasCalled.current = true;
    setState(state => ({
      ...state,
      value: typeof updater === 'function' ? updater(state) : updater,
    }));
  }, []);
  const prevValue = usePrevious(state.value);
  useEffect(() => {
    if (prevValue !== state.value && setValueWasCalled.current) {
      // If the state change was requested from the JavaScript side, i.e.,
      // not in response to a native-props change caused by the user's input
      // device, update the native props.
      ref.current?.setNativeProps({ text: state.value });
      setValueWasCalled.current = false;
    }
  });

  const setSelection = useCallback(() => {
    // TODO: Implement
    throw new Error('unimplemented!');
  }, []);

  const inputCallbacks = useMemo(
    () => ({
      onChangeText: (value: string) => {
        setState(state => ({ ...state, value }));
      },
      onSelectionChange: (event: SelectionChangeEvent) => {
        const { selection } = event.nativeEvent;
        setState(state => ({ ...state, selection }));
      },
    }),
    [],
  );

  return [ref, state, setValue, setSelection, inputCallbacks];
};
