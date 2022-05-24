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

type PropsBase = $ReadOnly<{|
  navigation: AppNavigationProp<'edit-stream' | 'create-stream'>,

  initialValues: {|
    name: string,
    description: string,
    privacy: Privacy,
  |},
|}>;

type PropsEditStream = $ReadOnly<{|
  ...PropsBase,

  isNewStream: false,
  onComplete: (changedValues: {|
    // Properties optional because some values might not have changed.

    +name?: string,
    +description?: string,
    +privacy?: Privacy,
  |}) => void | Promise<void>,
|}>;

type PropsCreateStream = $ReadOnly<{|
  ...PropsBase,

  isNewStream: true,
  onComplete: ({| name: string, description: string, privacy: Privacy |}) => void | Promise<void>,
|}>;

type Props = $ReadOnly<PropsEditStream | PropsCreateStream>;

export default function EditStreamCard(props: Props): Node {
  const { navigation, initialValues, isNewStream } = props;

  const [name, setName] = useState<string>(props.initialValues.name);
  const [description, setDescription] = useState<string>(props.initialValues.description);
  const [privacy, setPrivacy] = useState<Privacy>(props.initialValues.privacy);

  const handlePerformAction = useCallback(() => {
    if (props.isNewStream) {
      props.onComplete({ name, description, privacy });
    } else {
      props.onComplete({
        name: initialValues.name !== name ? name : undefined,
        description: initialValues.description !== description ? description : undefined,
        privacy: initialValues.privacy !== privacy ? privacy : undefined,
      });
    }
  }, [props, initialValues, name, description, privacy]);

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
        text={isNewStream ? 'Create' : 'Save'}
        disabled={name.length === 0}
        onPress={handlePerformAction}
      />
    </View>
  );
}
