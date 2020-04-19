/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Dispatch } from '../types';
import { connect } from '../react-redux';
import { Input, Label, OptionRow, ZulipButton, SelectionList } from '../common';
import styles from '../styles';
import { IconPrivate } from '../common/Icons';
import { getIsAdmin } from '../selectors';

type StreamPostPolicy = $ReadOnly<{| key: number, value: string |}>;

const STREAM_POST_POLICIES: StreamPostPolicy[] = [
  { key: 1, value: 'All stream members' },
  { key: 2, value: 'Only organization administrators' },
  { key: 3, value: 'Only organization full members' },
];

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
  dispatch: Dispatch,
  isNewStream: boolean,
  initialValues: {
    name: string,
    description: string,
    invite_only: boolean,
    stream_post_policy: number,
  },
  onComplete: (
    name: string,
    description: string,
    isPrivate: boolean,
    streamPostPolicy: number,
  ) => void,

  ...SelectorProps,
|}>;

type State = {|
  name: string,
  description: string,
  isPrivate: boolean,
  streamPostPolicyIndex: number,
|};

class EditStreamCard extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      name: this.props.initialValues.name,
      description: this.props.initialValues.description,
      isPrivate: this.props.initialValues.invite_only,
      streamPostPolicyIndex:
        STREAM_POST_POLICIES.findIndex(
          policy => policy.key === this.props.initialValues.stream_post_policy,
        ) || 0,
    };
  }

  handlePerformAction = () => {
    const { onComplete } = this.props;
    const { name, description, isPrivate, streamPostPolicyIndex } = this.state;
    onComplete(name, description, isPrivate, STREAM_POST_POLICIES[streamPostPolicyIndex].key);
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

  handleStreamPostPolicyChange = (index: number) => {
    this.setState({ streamPostPolicyIndex: index });
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
            selectedIndex={this.state.streamPostPolicyIndex}
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
