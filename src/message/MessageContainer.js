import React from 'react';
import htmlparser from 'htmlparser2';

import renderHtmlChildren from './html/renderHtmlChildren';
import MessageFull from './MessageFull';
import MessageBrief from './MessageBrief';

const htmlToDomTree = html => {
  let domTree = null;
  const parser = new htmlparser.Parser(new htmlparser.DomHandler((err, dom) => {
    if (!err) domTree = dom;
  }));
  parser.write(html);
  parser.done();
  return domTree;
};

export default class MessageContainer extends React.PureComponent {
  render() {
    const { auth, avatarUrl, timestamp, twentyFourHourTime, messageId,
      fromName, message, fromEmail, isBrief, reactions } = this.props;
    const MessageComponent = isBrief ? MessageBrief : MessageFull;
    const dom = htmlToDomTree(message);

    return (
      <MessageComponent
        messageId={messageId}
        avatarUrl={avatarUrl}
        fromName={fromName}
        fromEmail={fromEmail}
        timestamp={timestamp}
        twentyFourHourTime={twentyFourHourTime}
        reactions={reactions}
        selfEmail={auth.email}
      >
        {renderHtmlChildren({ childrenNodes: dom, auth })}
      </MessageComponent>
    );
  }
}
