/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import type { FlatList } from 'react-native';

import type { User, UserOrBot, PresenceState, Dispatch } from '../types';
import { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
import { FloatingActionButton, LineSeparator } from '../common';
import { IconDone } from '../common/Icons';
import UserList from '../users/UserList';
import AvatarList from './AvatarList';
import AnimatedScaleComponent from '../animation/AnimatedScaleComponent';
import { getPresence, getUsersSansMe, getUsersByEmail } from '../selectors';

const styles = createStyleSheet({
  wrapper: {
    flex: 1,
  },
  button: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
});

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  users: User[],
  usersByEmail: Map<string, User>,
  presences: PresenceState,
  filter: string,
  onComplete: (selected: User[]) => void,
|}>;

type State = {|
  selected: User[],
|};

class UserPickerCard extends PureComponent<Props, State> {
  state = {
    selected: [],
  };

  listRef: ?FlatList<User>;

  handleUserSelect = (email: string) => {
    const { usersByEmail } = this.props;
    const { selected } = this.state;

    const user = usersByEmail.get(email);
    if (user) {
      this.setState({
        selected: [...selected, user],
      });
    }
  };

  handleUserPress = (user: UserOrBot) => {
    const { selected } = this.state;
    if (selected.find(x => x.email === user.email)) {
      this.handleUserDeselect(user.email);
    } else {
      this.handleUserSelect(user.email);
    }
  };

  handleUserDeselect = (email: string) => {
    const { selected } = this.state;

    this.setState({
      selected: selected.filter(x => x.email !== email),
    });
  };

  handleComplete = () => {
    const { onComplete } = this.props;
    const { selected } = this.state;
    onComplete(selected);
  };

  componentDidUpdate = (prevProps: Props, prevState: State) => {
    const list = this.listRef;
    if (list && this.state.selected.length > prevState.selected.length) {
      setTimeout(() => list.scrollToEnd());
    }
  };

  render() {
    const { filter, users, presences } = this.props;
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
          />
        </AnimatedScaleComponent>
        {selected.length > 0 && <LineSeparator />}
        <UserList
          filter={filter}
          users={users}
          presences={presences}
          selected={selected}
          onPress={this.handleUserPress}
        />
        <AnimatedScaleComponent style={styles.button} visible={selected.length > 0}>
          <FloatingActionButton
            Icon={IconDone}
            size={50}
            disabled={selected.length === 0}
            onPress={this.handleComplete}
          />
        </AnimatedScaleComponent>
      </View>
    );
  }
}

export default connect(state => ({
  users: getUsersSansMe(state),
  usersByEmail: getUsersByEmail(state),
  presences: getPresence(state),
}))(UserPickerCard);
