/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import Input from '../common/Input';
import ZulipTextIntl from '../common/ZulipTextIntl';
import ZulipButton from '../common/ZulipButton';
import styles from '../styles';
import SelectableOptionRow from '../common/SelectableOptionRow';

const streamAccessPolicies = {
  web_public: {
    title: 'Web-public',
    policy: { invite_only: false, is_web_public: true, history_public_to_subscribers: true },
    description:
      'Organization members can join (guests must be invited by a subscriber); anyone on the Internet can view complete message history without creating an account',
  },
  public: {
    title: 'Public',
    policy: { invite_only: false, is_web_public: false, history_public_to_subscribers: false },
    description:
      'Organization members can join (guests must be invited by a subscriber); organization members can view complete message history without joining',
  },
  private_shared_history: {
    title: 'Private, shared history',
    policy: { invite_only: true, is_web_public: false, history_public_to_subscribers: true },
    description:
      'Must be invited by a subscriber; new subscribers can view complete message history; hidden from non-administrator users',
  },
  private_protected_history: {
    title: 'Private, protected history',
    policy: { invite_only: true, is_web_public: false, history_public_to_subscribers: false },
    description:
      'Must be invited by a subscriber; new subscribers can only see messages sent after they join; hidden from non-administrator users',
  },
};

type AccessPolicy = $Keys<typeof streamAccessPolicies>;

type StreamPolicySettings = {
  // The properties on a stream object that are related to the access policy.
  invite_only: boolean,
  is_web_public: boolean,
  history_public_to_subscribers: boolean,
  ...
};

export type StreamSettings = {|
  name: string,
  description: string,
  invite_only: boolean,
  is_web_public: boolean,
  history_public_to_subscribers: boolean,
|};

type Props = $ReadOnly<{|
  isNewStream: boolean,
  initialValues: StreamSettings,
  onComplete: (settings: StreamSettings) => void,
|}>;

type State = {|
  name: string,
  description: string,
  accessPolicy: AccessPolicy,
|};

const accessPolicyFromStreamSettings = (streamSettings: StreamPolicySettings): AccessPolicy => {
  const { is_web_public, invite_only, history_public_to_subscribers } = streamSettings;
  if (is_web_public) {
    return 'web_public';
  } else if (!invite_only) {
    return 'public';
  } else if (invite_only && history_public_to_subscribers) {
    return 'private_shared_history';
  } else {
    return 'private_protected_history';
  }
};

export default class EditStreamCard extends PureComponent<Props, State> {
  state: State = {
    name: this.props.initialValues.name,
    description: this.props.initialValues.description,
    accessPolicy: accessPolicyFromStreamSettings(this.props.initialValues),
  };

  handlePerformAction: () => void = () => {
    const { onComplete } = this.props;
    const { name, description, accessPolicy } = this.state;
    onComplete({ name, description, ...streamAccessPolicies[accessPolicy].policy });
  };

  handleNameChange: string => void = name => {
    this.setState({ name });
  };

  handleDescriptionChange: string => void = description => {
    this.setState({ description });
  };

  handleAccessPolicyChange: (AccessPolicy, boolean) => void = (accessPolicy, selected) => {
    if (selected) {
      this.setState({ accessPolicy });
    }
  };

  render(): Node {
    const { initialValues, isNewStream } = this.props;
    const { name } = this.state;

    return (
      <View>
        <ZulipTextIntl text="Name" />
        <Input
          style={styles.marginBottom}
          placeholder="Name"
          autoFocus
          defaultValue={initialValues.name}
          onChangeText={this.handleNameChange}
        />
        <ZulipTextIntl text="Description" />
        <Input
          style={styles.marginBottom}
          placeholder="Description"
          defaultValue={initialValues.description}
          onChangeText={this.handleDescriptionChange}
        />
        <ZulipTextIntl text="Who can access this stream?" />
        {Object.keys(streamAccessPolicies).map(policy => (
          <SelectableOptionRow
            key={policy}
            itemKey={policy}
            title={streamAccessPolicies[policy].title}
            selected={this.state.accessPolicy === policy}
            onRequestSelectionChange={this.handleAccessPolicyChange}
          />
        ))}
        <ZulipButton
          style={styles.marginTop}
          text={isNewStream ? 'Create' : 'Update'}
          disabled={name.length === 0}
          onPress={this.handlePerformAction}
        />
      </View>
    );
  }
}
