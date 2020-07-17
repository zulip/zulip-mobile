/* @flow strict-local */

import React, { PureComponent } from 'react';
import { StyleSheet, View, BackHandler, Alert } from 'react-native';

import { Set } from 'immutable';
import type { Dispatch, Narrow, GetText, Auth, Subscription } from '../types';
import { connect } from '../react-redux';
import { TranslationContext } from '../boot/TranslationProvider';
import {
  HOME_NARROW,
  MENTIONED_NARROW,
  STARRED_NARROW,
  topicNarrow,
  caseNarrowPartial,
} from '../utils/narrow';
import NavButton from '../nav/NavButton';
import NavButtonGeneral from '../nav/NavButtonGeneral';
import UnreadCards from '../unread/UnreadCards';
import { doNarrow, navigateToSearch } from '../actions';
import IconUnreadMentions from '../nav/IconUnreadMentions';
import commonStyles, { BRAND_COLOR, NAVBAR_SIZE } from '../styles';
import * as api from '../api';
import { getAuth, getSubscriptionsByName } from '../selectors';
import { LoadingBanner, Label } from '../common';
import { showToast } from '../utils/info';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
  },
  iconList: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  bulkSelectionNav: {
    flexDirection: 'row',
    height: NAVBAR_SIZE,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'hsla(0, 0%, 50%, 0.25)',
  },
  selectionCountText: {
    textAlign: 'left',
    marginLeft: 8,
  },
  button: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 18,
    marginLeft: 4,
    marginRight: 4,
  },
});

type SelectorProps = $ReadOnly<{|
  auth: Auth,
  subscriptionsByName: Map<string, Subscription>,
|}>;

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  ...SelectorProps,
|}>;

type State = $ReadOnly<{|
  bulkSelection: Set<string> | null,
|}>;

class HomeTab extends PureComponent<Props, State> {
  static contextType = TranslationContext;
  backHandler;
  context: GetText;
  state = {
    bulkSelection: null,
  };

  handleBackPress = (): boolean => {
    if (this.state.bulkSelection !== null) {
      this.setState({ bulkSelection: null });
      return true;
    }
    return false;
  };

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  handleTopicSelect = (stream: string, topic: string) => {
    const { bulkSelection } = this.state;
    const narrow = JSON.stringify(topicNarrow(stream, topic));

    if (bulkSelection == null) {
      const selection = Set<Narrow>([narrow]);
      this.setState({ bulkSelection: selection });
      return;
    }

    if (bulkSelection.has(narrow)) {
      this.setState({ bulkSelection: bulkSelection.delete(narrow) });
    } else {
      this.setState({ bulkSelection: bulkSelection.add(narrow) });
    }
  };

  processBulkCommon = (type: 'mute' | 'read') => {
    const { auth, subscriptionsByName } = this.props;
    const { bulkSelection } = this.state;
    const _ = this.context;
    const apiPromises = [];

    if (type === 'mute') {
      showToast(_('Muting selected topics'));
    } else {
      showToast(_('Marking selected topics as read'));
    }

    if (bulkSelection == null) {
      return;
    }

    bulkSelection.forEach(narrow => {
      const parsedNarrow: Narrow = JSON.parse(narrow);
      caseNarrowPartial(parsedNarrow, {
        topic: (stream: string, topic: string) => {
          if (type === 'mute') {
            apiPromises.push(api.muteTopic(auth, stream, topic));
          } else {
            const subscription = subscriptionsByName.get(stream);
            if (subscription === undefined) {
              return;
            }
            apiPromises.push(api.markTopicAsRead(auth, subscription.stream_id, topic));
          }
        },
      });
    });

    this.setState({ bulkSelection: null });

    Promise.all(apiPromises).catch(err => {
      const alertTitle =
        type === 'mute' ? _('Failed to mute some topics') : _('Failed to mark some topics as read');

      Alert.alert(alertTitle, err.message);
    });
  };

  muteBulkSelection = () => {
    this.processBulkCommon('mute');
  };

  readBulkSelection = () => {
    this.processBulkCommon('read');
  };

  cancelBulkSelection = () => {
    this.setState({ bulkSelection: null });
  };

  renderHeader = () => {
    const { dispatch } = this.props;
    const { bulkSelection } = this.state;
    const _ = this.context;

    if (bulkSelection === null) {
      return (
        <View style={styles.iconList}>
          <NavButton
            name="globe"
            onPress={() => {
              dispatch(doNarrow(HOME_NARROW));
            }}
          />
          <NavButton
            name="star"
            onPress={() => {
              dispatch(doNarrow(STARRED_NARROW));
            }}
          />
          <NavButtonGeneral
            onPress={() => {
              dispatch(doNarrow(MENTIONED_NARROW));
            }}
          >
            <IconUnreadMentions color={BRAND_COLOR} />
          </NavButtonGeneral>
          <NavButton
            name="search"
            onPress={() => {
              dispatch(navigateToSearch());
            }}
          />
        </View>
      );
    }

    const color = BRAND_COLOR;
    const countText = _.intl.formatMessage(
      {
        id: '{count} topics selected',
        defaultMessage: '{count} topics selected',
      },
      { count: bulkSelection.size },
    );

    return (
      <View style={styles.bulkSelectionNav}>
        <NavButton
          name="arrow-left"
          color={color}
          onPress={this.cancelBulkSelection}
          title={_('Cancel')}
        />
        <View style={commonStyles.navWrapper}>
          <Label text={countText} style={styles.selectionCountText} />
        </View>
        <NavButton
          name="volume-x"
          color={color}
          onPress={this.muteBulkSelection}
          title={_('Mute')}
        />
        <NavButton
          name="check"
          color={color}
          onPress={this.readBulkSelection}
          title={_('Mark as read')}
        />
      </View>
    );
  };

  render() {
    const { bulkSelection } = this.state;

    return (
      <View style={styles.wrapper}>
        {this.renderHeader()}
        <LoadingBanner />
        <UnreadCards bulkSelection={bulkSelection} handleTopicSelect={this.handleTopicSelect} />
      </View>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  auth: getAuth(state),
  subscriptionsByName: getSubscriptionsByName(state),
}))(HomeTab);
