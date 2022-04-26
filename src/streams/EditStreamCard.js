/* @flow strict-local */
import React, { useState, useCallback } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import Input from '../common/Input';
import ZulipTextIntl from '../common/ZulipTextIntl';
import SwitchRow from '../common/SwitchRow';
import ZulipButton from '../common/ZulipButton';
import styles, { createStyleSheet } from '../styles';
import { IconPrivate } from '../common/Icons';

/* eslint-disable no-shadow */

const componentStyles = createStyleSheet({
  switchRow: {
    paddingLeft: 8,
    paddingRight: 8,
  },
});

type Privacy = 'public' | 'private';

type Props = $ReadOnly<{|
  isNewStream: boolean,
  initialValues: {|
    name: string,
    description: string,
    privacy: Privacy,
  |},
  onComplete: (name: string, description: string, privacy: Privacy) => void | Promise<void>,
|}>;

export default function EditStreamCard(props: Props): Node {
  const { onComplete, initialValues, isNewStream } = props;

  const [name, setName] = useState<string>(props.initialValues.name);
  const [description, setDescription] = useState<string>(props.initialValues.description);
  const [privacy, setPrivacy] = useState<Privacy>(props.initialValues.privacy);

  const handlePerformAction = useCallback(() => {
    onComplete(name, description, privacy);
  }, [onComplete, name, description, privacy]);

  const handleNameChange = useCallback(name => {
    setName(name);
  }, []);

  const handleDescriptionChange = useCallback(description => {
    setDescription(description);
  }, []);

  const handlePrivacyChange = useCallback(isPrivate => {
    setPrivacy(isPrivate ? 'private' : 'public');
  }, []);

  return (
    <View>
      <ZulipTextIntl text="Name" />
      <Input
        style={styles.marginBottom}
        placeholder="Name"
        autoFocus
        defaultValue={initialValues.name}
        onChangeText={handleNameChange}
      />
      <ZulipTextIntl text="Description" />
      <Input
        style={styles.marginBottom}
        placeholder="Description"
        defaultValue={initialValues.description}
        onChangeText={handleDescriptionChange}
      />
      <SwitchRow
        style={componentStyles.switchRow}
        Icon={IconPrivate}
        label="Private"
        value={privacy === 'private'}
        onValueChange={handlePrivacyChange}
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
