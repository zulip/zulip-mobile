/* @flow strict-local */
import React, { useState, useCallback, useMemo } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { Privacy } from './streamsActions';
import type { AppNavigationProp } from '../nav/AppNavigator';
import Input from '../common/Input';
import InputRowRadioButtons from '../common/InputRowRadioButtons';
import ZulipTextIntl from '../common/ZulipTextIntl';
import ZulipButton from '../common/ZulipButton';
import styles from '../styles';

/* eslint-disable no-shadow */

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'edit-stream' | 'create-stream'>,

  isNewStream: boolean,
  initialValues: {|
    name: string,
    description: string,
    privacy: Privacy,
  |},
  onComplete: (name: string, description: string, privacy: Privacy) => void | Promise<void>,
|}>;

export default function EditStreamCard(props: Props): Node {
  const { navigation, onComplete, initialValues, isNewStream } = props;

  const [name, setName] = useState<string>(props.initialValues.name);
  const [description, setDescription] = useState<string>(props.initialValues.description);
  const [privacy, setPrivacy] = useState<Privacy>(props.initialValues.privacy);

  const handlePerformAction = useCallback(() => {
    onComplete(name, description, privacy);
  }, [onComplete, name, description, privacy]);

  const privacyOptions = useMemo(
    () => [
      { key: 'public', title: 'Public' },
      { key: 'private', title: 'Private' },
    ],
    [],
  );

  return (
    <View>
      <ZulipTextIntl text="Name" />
      <Input
        style={styles.marginBottom}
        placeholder="Name"
        autoFocus
        defaultValue={initialValues.name}
        onChangeText={setName}
      />
      <ZulipTextIntl text="Description" />
      <Input
        style={styles.marginBottom}
        placeholder="Description"
        defaultValue={initialValues.description}
        onChangeText={setDescription}
      />
      <InputRowRadioButtons
        navigation={navigation}
        label="Privacy"
        items={privacyOptions}
        valueKey={privacy}
        onValueChange={setPrivacy}
      />
      <ZulipButton
        style={styles.marginTop}
        text={isNewStream ? 'Create' : 'Update'}
        disabled={name.length === 0}
        onPress={handlePerformAction}
      />
    </View>
  );
}
