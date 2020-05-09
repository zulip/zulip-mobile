/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Dispatch, StreamPostPolicy } from '../types';
import { StreamPostPolicies } from '../api/modelTypes';
import { connect } from '../react-redux';
import { Input, Label, OptionRow, ZulipButton, SelectionList } from '../common';
import styles from '../styles';
import { IconPrivate } from '../common/Icons';
import { getIsAdmin } from '../selectors';

const STREAM_POST_POLICIES = new Map([
  [StreamPostPolicies.everyone, { label: 'All stream members' }],
  [StreamPostPolicies.admins, { label: 'Only organization administrators' }],
  [StreamPostPolicies.restrict_new_members, { label: 'Only organization full members' }],
]);

const componentStyles = StyleSheet.create({
  optionRow: {
    paddingLeft: 8,
    paddingRight: 8,
  },
});

type SelectorProps = {|
  isAdmin: boolean,
|};

type Props = $ReadOnly<{|
  isNewStream: boolean,
  initialValues: {
    name: string,
    description: string,
    invite_only: boolean,
    is_announcement_only: boolean,
    stream_post_policy?: StreamPostPolicy,
  },
  onComplete: (
    name: string,
    description: string,
    isPrivate: boolean,
    streamPostPolicy: StreamPostPolicy,
  ) => void,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

type State = {|
  name: string,
  description: string,
  isPrivate: boolean,
  streamPostPolicy: StreamPostPolicy,
|};

class EditStreamCard extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      name: this.props.initialValues.name,
      description: this.props.initialValues.description,
      isPrivate: this.props.initialValues.invite_only,
      streamPostPolicy:
        this.props.initialValues.stream_post_policy
        || (this.props.initialValues.is_announcement_only
          ? StreamPostPolicies.admins
          : StreamPostPolicies.everyone),
    };
  }

  handlePerformAction = () => {
    const { onComplete } = this.props;
    const { name, description, isPrivate, streamPostPolicy } = this.state;
    onComplete(name, description, isPrivate, streamPostPolicy);
  };

  handleNameChange = (name: string) => {
    this.setState({ name });
  };

  handleDescriptionChange = (description: string) => {
    this.setState({ description });
  };

  handleIsPrivateChange = (isPrivate: boolean) => {
    this.setState({ isPrivate });
  };

  handleStreamPostPolicyChange = (selectedKey: StreamPostPolicy) => {
    this.setState({ streamPostPolicy: selectedKey });
  };

  render() {
    const { initialValues, isNewStream, isAdmin } = this.props;
    const { name } = this.state;

    return (
      <View>
        <Label text="Name" />
        <Input
          style={styles.marginBottom}
          placeholder="Name"
          autoFocus
          defaultValue={initialValues.name}
          onChangeText={this.handleNameChange}
        />
        <Label text="Description" />
        <Input
          style={styles.marginBottom}
          placeholder="Description"
          defaultValue={initialValues.description}
          onChangeText={this.handleDescriptionChange}
        />
        <OptionRow
          style={componentStyles.optionRow}
          Icon={IconPrivate}
          label="Private"
          value={this.state.isPrivate}
          onValueChange={this.handleIsPrivateChange}
        />
        {isAdmin && (
          <SelectionList.Selector
            style={[componentStyles.optionRow, styles.listItem]}
            label="Who can post to the stream?"
            options={STREAM_POST_POLICIES}
            selectedKey={this.state.streamPostPolicy}
            onOptionSelect={this.handleStreamPostPolicyChange}
          />
        )}
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

export default connect<SelectorProps, _, _>((state, props) => ({
  isAdmin: getIsAdmin(state),
}))(EditStreamCard);
