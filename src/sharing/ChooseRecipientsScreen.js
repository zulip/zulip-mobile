/* @flow strict-local */
import React, { useState, useCallback } from 'react';
import type { UserId, UserOrBot } from '../types';
import { Screen } from '../common';
import UserPickerCard from '../user-picker/UserPickerCard';

type Props = $ReadOnly<{|
  onComplete: ($ReadOnlyArray<UserId>) => void,
|}>;

export default function ChooseRecipientsScreen(props: Props) {
  const { onComplete } = props;
  const [filter, setFilter] = useState<string>('');

  const handleFilterChange = useCallback((_filter: string) => setFilter(_filter), []);

  const handleComplete = useCallback(
    (selected: Array<UserOrBot>) => {
      onComplete(selected.map(u => u.user_id));
    },
    [onComplete],
  );

  return (
    <Screen search scrollEnabled={false} searchBarOnChange={handleFilterChange} canGoBack={false}>
      <UserPickerCard filter={filter} onComplete={handleComplete} />
    </Screen>
  );
}
