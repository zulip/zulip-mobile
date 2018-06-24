/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import type { User, PresenceState } from '../types';
import { LineSeparator } from '../common';
import UserList from '../users/UserList';
import AvatarList from './AvatarList';
import AnimatedScaleComponent from '../animation/AnimatedScaleComponent';
import { getOwnEmail, getPresence, getUsersSansMe } from '../selectors';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
});

type Props = {
  ownEmail: string,
  users: User[],
  presences: PresenceState,
  filter: string,
  onComplete: (selected: User[]) => void,
};

type State = {
  selected: User[],
};

class UserPickerCard extends PureComponent<Props, State> {
  listRef: (component: any) => void;

  props: Props;
  state: State;

  state = {
    selected: [],
  };

  handleUserSelect = (email: string) => {
    const { users } = this.props;
    const { selected } = this.state;

    const user = users.find(x => x.email === email);
    if (user) {
      this.setState({
        selected: [...selected, user],
      });
    }
  };

  handleUserPress = (email: string) => {
    const { selected } = this.state;

    if (selected.find(x => x.email === email)) {
      this.handleUserDeselect(email);
    } else {
      this.handleUserSelect(email);
    }
  };

  handleUserDeselect = (email: string) => {
    console.log('PRESSED');
    const { selected } = this.state;

    this.setState({
      selected: selected.filter(x => x.email !== email),
    });
  };

  handleComplete = () => {
    console.log('COMPLETED');
    const { onComplete } = this.props;
    const { selected } = this.state;
    onComplete(selected);
  };

  componentDidUpdate = (prevProps: Props, prevState: State) => {
    if (this.listRef && this.state.selected.length > prevState.selected.length) {
      setTimeout(() => this.listRef.scrollToEnd());
    }
  };

  render() {
    const { filter, ownEmail, users, presences } = this.props;
    const { selected } = this.state;
    return (
      <View style={styles.wrapper}>
        <AnimatedScaleComponent visible={selected.length > 0}>
          <AvatarList
            listRef={component => {
              this.listRef = component;
            }}
            users={selected}
            onPress={this.handleUserDeselect}
            onButtonPress={this.handleComplete}
          />
        </AnimatedScaleComponent>
        {selected.length > 0 && <LineSeparator />}
        <UserList
          style={styles.list}
          ownEmail={ownEmail}
          filter={filter}
          users={users}
          presences={presences}
          selected={selected}
          onPress={this.handleUserPress}
        />
      </View>
    );
  }
}

export default connect(state => ({
  ownEmail: getOwnEmail(state),
  users: getUsersSansMe(state),
  presences: getPresence(state),
}))(UserPickerCard);
