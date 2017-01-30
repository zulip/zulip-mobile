import React from 'react';
import htmlparser from 'htmlparser2';

import HtmlChildren from './html/HtmlChildren';
import MessageFull from './MessageFull';
import MessageBrief from './MessageBrief';

const htmlToDomTree = html => {
  let domTree = null;
  const parser = new htmlparser.Parser(new htmlparser.DomHandler((err, dom) => {
    if (!err) domTree = dom;
  }));
  parser.write(html.replace(/\n|\r/g, ''));
  parser.done();
  return domTree;
};

export default class MessageContainer extends React.PureComponent {
  render() {
    const { auth, avatarUrl, timestamp, twentyFourHourTime,
      fromName, message, fromEmail, isBrief, reactions } = this.props;
    const MessageComponent = isBrief ? MessageBrief : MessageFull;
    const dom = htmlToDomTree(message);

    return (
      <MessageComponent
        avatarUrl={avatarUrl}
        fromName={fromName}
        fromEmail={fromEmail}
        timestamp={timestamp}
        twentyFourHourTime={twentyFourHourTime}
        reactions={reactions}
        selfEmail={auth.email}
      >
        <HtmlChildren childrenNodes={dom} auth={auth} />
      </MessageComponent>
    );
  }
}
