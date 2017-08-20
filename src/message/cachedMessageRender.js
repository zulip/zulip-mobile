/* @flow */
import React from 'react';
import isEqual from 'lodash.isequal';

import type { RenderedSectionDescriptor } from '../types';
import MessageListSection from './MessageListSection';
import MessageListItem from './MessageListItem';

let lastRenderedMessages = null;
let cachedRenderedData = {};

export default (renderedMessages: RenderedSectionDescriptor[]): Object => {
  if (lastRenderedMessages === renderedMessages) {
    return cachedRenderedData;
  }

  if (!isEqual(lastRenderedMessages, renderedMessages)) {
    const messageList: Object[] = React.Children.toArray(
      renderedMessages.reduce((result, section) => {
        result.push(
          <MessageListSection key={section.key} message={section.message} />,
          section.data.map(item => <MessageListItem {...item} />),
        );
        return result;
      }, []),
    );

    const stickyHeaderIndices = messageList
      .map((component, idx) => (component.type === MessageListSection ? idx + 1 : -1))
      .filter(idx => idx !== -1);

    cachedRenderedData = { messageList, stickyHeaderIndices };
  }
  lastRenderedMessages = renderedMessages;

  return cachedRenderedData;
};
