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

type Props = $ReadOnly<{|
  isNewStream: boolean,
  initialValues: {|
    name: string,
    description: string,
    invite_only: boolean,
  |},
  onComplete: (name: string, description: string, invite_only: boolean) => void | Promise<void>,
|}>;

export default function EditStreamCard(props: Props): Node {
  const { onComplete, initialValues, isNewStream } = props;

  const [name, setName] = useState<string>(props.initialValues.name);
  const [description, setDescription] = useState<string>(props.initialValues.description);
  const [inviteOnly, setInviteOnly] = useState<boolean>(props.initialValues.invite_only);

  const handlePerformAction = useCallback(() => {
    onComplete(name, description, inviteOnly);
  }, [onComplete, name, description, inviteOnly]);

  const handleNameChange = useCallback(name => {
    setName(name);
  }, []);

  const handleDescriptionChange = useCallback(description => {
    setDescription(description);
  }, []);

  const handleInviteOnlyChange = useCallback(invite_only => {
    setInviteOnly(invite_only);
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
        value={inviteOnly}
        onValueChange={handleInviteOnlyChange}
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
