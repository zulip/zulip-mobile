/* @flow strict-local */

import React, { useState, useCallback } from 'react';
import type { Node } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { useSelector, useDispatch } from '../react-redux';
import { Screen } from '../common';
import LanguagePicker from './LanguagePicker';
import { getSettings } from '../selectors';
import { settingsChange } from '../actions';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'language'>,
  route: RouteProp<'language', void>,
|}>;

/**
 * A screen to choose the language for the app UI.
 *
 * Needs to occupy the horizontal insets because its descendents (the
 * language items) do.
 */
export default function LanguageScreen(props: Props): Node {
  const dispatch = useDispatch();
  const language = useSelector(state => getSettings(state).language);

  const [filter, setFilter] = useState<string>('');

  const handleLocaleChange = useCallback(
    (value: string) => {
      dispatch(settingsChange({ language: value }));
    },
    [dispatch],
  );

  return (
    <Screen search searchBarOnChange={setFilter} scrollEnabled={false}>
      <LanguagePicker value={language} onValueChange={handleLocaleChange} filter={filter} />
    </Screen>
  );
}
