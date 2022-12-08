// @flow strict-local
import * as React from 'react';
import { View } from 'react-native';

import { type UserOrBot, type UserId } from '../api/modelTypes';
import WebLink from '../common/WebLink';
import ZulipText from '../common/ZulipText';
import ZulipTextIntl from '../common/ZulipTextIntl';
import { ensureUnreachable } from '../generics';
import { useSelector } from '../react-redux';
import { tryGetUserForId } from '../selectors';
import {
  type CustomProfileFieldValue,
  getCustomProfileFieldsForUser,
} from '../users/userSelectors';
import UserItem from '../users/UserItem';
import { useNavigation } from '../react-navigation';

/* eslint-disable no-shadow */

type Props = {|
  +user: UserOrBot,
|};

function CustomProfileFieldUser(props: {| +userId: UserId |}): React.Node {
  const { userId } = props;
  const user = useSelector(state => tryGetUserForId(state, userId));

  const navigation = useNavigation();
  const onPress = React.useCallback(
    (user: UserOrBot) => {
      navigation.push('account-details', { userId: user.user_id });
    },
    [navigation],
  );

  if (!user) {
    return <ZulipTextIntl text="(unknown user)" />;
  }

  return <UserItem userId={userId} onPress={onPress} size="medium" />;
}

function CustomProfileFieldRow(props: {|
  +name: string,
  +value: CustomProfileFieldValue,
  +first: boolean,
|}): React.Node {
  const { first, name, value } = props;

  const styles = React.useMemo(
    () => ({
      row: { marginTop: first ? 0 : 8, flexDirection: 'row' },
      label: { width: 96, fontWeight: 'bold' },
      valueView: { flex: 1, paddingStart: 8 },
      valueText: { flex: 1, paddingStart: 8 },
      // The padding difference compensates for the paddingHorizontal in UserItem.
      valueUnpadded: { flex: 1 },
    }),
    [first],
  );

  let valueElement = undefined;
  switch (value.displayType) {
    case 'text':
      valueElement = <ZulipText selectable style={styles.valueText} text={value.text} />;
      break;

    case 'link':
      valueElement = (
        <View style={styles.valueView}>
          {value.url ? (
            <WebLink url={value.url}>
              <ZulipText text={value.text} />
            </WebLink>
          ) : (
            <ZulipText text={value.text} />
          )}
        </View>
      );
      break;

    case 'users':
      valueElement = (
        <View style={styles.valueUnpadded}>
          {value.userIds.map(userId => (
            <CustomProfileFieldUser key={userId} userId={userId} />
          ))}
        </View>
      );
      break;

    default:
      ensureUnreachable(value.displayType);
      return null;
  }

  return (
    <View style={styles.row}>
      <ZulipText style={styles.label} text={name} />
      {valueElement}
    </View>
  );
}

export default function CustomProfileFields(props: Props): React.Node {
  const { user } = props;
  const realm = useSelector(state => state.realm);

  const fields = React.useMemo(() => getCustomProfileFieldsForUser(realm, user), [realm, user]);

  const styles = React.useMemo(
    () => ({
      outer: { flexDirection: 'row', justifyContent: 'center' },
      inner: { flexBasis: 400, flexShrink: 1 },
    }),
    [],
  );

  return (
    <View style={styles.outer}>
      <View style={styles.inner}>
        {fields.map((field, i) => (
          <CustomProfileFieldRow
            key={field.fieldId}
            name={field.name}
            value={field.value}
            first={i === 0}
          />
        ))}
      </View>
    </View>
  );
}
