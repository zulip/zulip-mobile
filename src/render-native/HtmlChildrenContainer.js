/* @flow */
import React, { PureComponent } from 'react';
import { View, TouchableWithoutFeedback } from 'react-native';

import type { Message, Auth, Actions } from '../types';
import htmlToDomTree from './html/htmlToDomTree';
import renderHtmlChildren from './html/renderHtmlChildren';
import getMessageContent from './getMessageContent';

type Props = {
  message: Message,
  auth: Auth,
  actions: Actions,
  onLinkPress: string => void,
  onLongPress: () => void,
};

class HtmlChildrenContainer extends PureComponent<Props> {
  props: Props;

  render() {
    const { message, auth, actions, onLinkPress, onLongPress } = this.props;
    const content = getMessageContent(message.match_content || message.content);
    const childrenNodes = htmlToDomTree(content);

    return (
      <TouchableWithoutFeedback onLongPress={onLongPress}>
        <View>
          {renderHtmlChildren({
            childrenNodes,
            auth,
            actions,
            message,
            onPress: onLinkPress,
          })}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

export default HtmlChildrenContainer;
