/* @flow */
import { connect } from 'react-redux';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import type { GlobalState } from '../types';
import { Screen } from '../common';
import InfoItem from './InfoItem';
import { getSession } from '../selectors';
import { longDate, shortTime } from '../utils/date';

type Props = {
  eventQueueId: number,
  lastEventId: number,
  lastEventTimestamp: number,
  queueRegistrationTimestamp: number,
};

class EventQueueDiagScreen extends PureComponent<Props> {
  props: Props;

  render() {
    const {
      eventQueueId,
      lastEventId,
      lastEventTimestamp,
      queueRegistrationTimestamp,
    } = this.props;
    const variables = {
      'Event queue id': eventQueueId,
      'Queue register time': `${longDate(new Date(queueRegistrationTimestamp))},  ${shortTime(
        new Date(queueRegistrationTimestamp),
      )}`,
      'Last event id': lastEventId,
      'Last event time': `${longDate(new Date(lastEventTimestamp))},  ${shortTime(
        new Date(lastEventTimestamp),
      )}`,
      'Queue active from': distanceInWordsToNow(queueRegistrationTimestamp),
    };
    return (
      <Screen title="Event Queue Diagnostics" padding>
        <FlatList
          data={Object.keys(variables)}
          keyExtractor={item => item}
          renderItem={({ item }) => <InfoItem label={item} value={variables[item]} />}
        />
      </Screen>
    );
  }
}

export default connect((state: GlobalState) => ({
  eventQueueId: getSession(state).eventQueueId,
  lastEventId: getSession(state).lastEventId,
  lastEventTimestamp: getSession(state).lastEventTimestamp,
  queueRegistrationTimestamp: getSession(state).queueRegistrationTimestamp,
}))(EventQueueDiagScreen);
