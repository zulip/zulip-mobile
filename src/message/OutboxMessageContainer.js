/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import type { Actions, Auth } from '../types';
import htmlToDomTree from '../html/htmlToDomTree';
import renderHtmlChildren from '../html/renderHtmlChildren';
import MessageFull from './MessageFull';
import MessageBrief from './MessageBrief';
import { getAuth } from '../selectors';
import boundActions from '../boundActions';

class OutboxMessageContainer extends PureComponent {
  props: {
    actions: Actions,
    message: Object,
    auth: Auth,
    twentyFourHourTime: boolean,
    isBrief: boolean,
  };

  static defaultProps = {
    twentyFourHourTime: false,
  };

  render() {
    const { message, auth, actions, twentyFourHourTime, isBrief } = this.props;
    const MessageComponent = isBrief ? MessageBrief : MessageFull;
    const childrenNodes = htmlToDomTree(message.parsedContent);
    return (
      <MessageComponent
        message={message}
        twentyFourHourTime={twentyFourHourTime}
        ownEmail={message.email}
        isNotYetSent
        actions={actions}>
        {renderHtmlChildren({
          childrenNodes,
          auth,
          actions,
          message,
        })}
      </MessageComponent>
    );
  }
}

export default connect(
  state => ({
    auth: getAuth(state),
    twentyFourHourTime: state.realm.twentyFourHourTime,
  }),
  boundActions,
)(connectActionSheet(OutboxMessageContainer));
