/* @flow strict-local */

import React, { useState, useCallback } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import type { Dispatch } from '../types';
import { connect } from '../react-redux';
import { Screen } from '../common';
import LanguagePicker from './LanguagePicker';
import { getSettings } from '../selectors';
import { settingsChange } from '../actions';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'language'>,
  route: RouteProp<'language', void>,

  dispatch: Dispatch,
  locale: string,
|}>;

function LanguageScreen(props: Props) {
  const { locale } = props;
  const [filter, setFilter] = useState<string>('');

  const handleLocaleChange = useCallback(
    (value: string) => {
      const { dispatch } = props;
      dispatch(settingsChange({ locale: value }));
    },
    [props],
  );

  const handleFilterChange = useCallback((f: string) => setFilter(f), []);

  return (
    <Screen search searchBarOnChange={handleFilterChange} scrollEnabled={false}>
      <LanguagePicker value={locale} onValueChange={handleLocaleChange} filter={filter} />
    </Screen>
  );
}

export default connect(state => ({
  locale: getSettings(state).locale,
}))(LanguageScreen);
