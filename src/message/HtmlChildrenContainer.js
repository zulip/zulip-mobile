/* @flow */
import React, { PureComponent } from 'react';
import { RenderTest } from 'react-native-js-watchdog';

import type { Message } from '../types';
import htmlToDomTree from '../html/htmlToDomTree';
import renderHtmlChildren from '../html/renderHtmlChildren';
import getMessageContent from './getMessageContent';

class HtmlChildrenContainer extends PureComponent {
  props: {
    message: Message,
  };

  render() {
    const { message, auth, actions, handleLinkPress } = this.props;
    const content = getMessageContent(message.match_content || message.content);
    const childrenNodes = htmlToDomTree(content);

    return renderHtmlChildren({
      childrenNodes,
      auth,
      actions,
      message,
      onPress: handleLinkPress,
    });
  }
}

export default RenderTest(HtmlChildrenContainer, { verbose: false });
