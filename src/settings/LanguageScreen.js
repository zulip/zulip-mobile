/* @flow strict-local */

import React, { useState, useCallback } from 'react';

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

export default function LanguageScreen(props: Props) {
  const dispatch = useDispatch();
  const locale = useSelector(state => getSettings(state).locale);

  const [filter, setFilter] = useState<string>('');

  const handleLocaleChange = useCallback(
    (value: string) => {
      dispatch(settingsChange({ locale: value }));
    },
    [dispatch],
  );

  return (
    <Screen search searchBarOnChange={setFilter} scrollEnabled={false}>
      <LanguagePicker value={locale} onValueChange={handleLocaleChange} filter={filter} />
    </Screen>
  );
}
