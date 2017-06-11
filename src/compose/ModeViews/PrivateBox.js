/* @flow */
import React, { Component } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';

import PeopleAutocomplete from '../../autocomplete/PeopleAutocomplete';
import { Input } from '../../common';
import { getUsersByEmails } from '../../users/usersSelectors';
import { Narrow } from '../../types';

const styles = StyleSheet.create({
  topicInput: {
    flex: 1,
  }
});

type Props = {
  operator: string | Object,
  setOperator: () => void,
  narrow: Narrow,
  users: Object[]
};

export default class PrivateBox extends Component {
  operandInput: TextInput;

  props: Props;

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.narrow !== nextProps.narrow) {
      if (nextProps.narrow[0].operator === 'pm-with') {
        const emails = nextProps.narrow[0].operand.split(',');
        const names = getUsersByEmails(nextProps.users, emails)
                          .map(user => user.fullName);
        nextProps.setOperator({ name: names, email: emails });
      }
    }
  }

  handleAutocomplete = (autocomplete: Object) => {
    const { setOperator } = this.props;
    setOperator({ name: [autocomplete.fullName], email: [autocomplete.email] });
  }

  extractNameFromObject = (operator: string | Object) => {
    if (operator !== null && typeof operator === 'object') {
      return operator.name.join(',');
    } else if (typeof operator === 'string') {
      return operator;
    }
    return '';
  }

  render() {
    const { operator, setOperator } = this.props;
    const name = this.extractNameFromObject(operator);
    return (
      <View style={styles.topicInput}>
        {operator !== null && !operator.email &&
          <PeopleAutocomplete
            filter={name}
            onAutocomplete={this.handleAutocomplete}
            noBorder
          />}
        <Input
          ref={component => { this.operandInput = component; }}
          placeholder={'Enter Name'}
          onChange={(event) => setOperator(
            event.nativeEvent.text
          )}
          value={name}
          style={styles.topicInput}
          noBorder
        />
      </View>
    );
  }
}
