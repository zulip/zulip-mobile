/* @flow strict-local */

import React, { useState, useCallback } from 'react';
import type { Node } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { useGlobalSelector, useDispatch } from '../react-redux';
import { Screen } from '../common';
import LanguagePicker from './LanguagePicker';
import { getGlobalSettings } from '../selectors';
import { setGlobalSettings } from '../actions';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'language'>,
  route: RouteProp<'language', void>,
|}>;

export default function LanguageScreen(props: Props): Node {
  const dispatch = useDispatch();
  const language = useGlobalSelector(state => getGlobalSettings(state).language);

  const [filter, setFilter] = useState<string>('');

  const handleLocaleChange = useCallback(
    (value: string) => {
      dispatch(setGlobalSettings({ language: value }));
    },
    [dispatch],
  );

  return (
    <Screen search searchBarOnChange={setFilter} scrollEnabled={false}>
      <LanguagePicker value={language} onValueChange={handleLocaleChange} filter={filter} />
    </Screen>
  );
}
