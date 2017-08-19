/* @flow */
import React from 'react';

import type { RenderedSectionDescriptor } from '../types';
import MessageListSection from './MessageListSection';
import MessageListItem from './MessageListItem';

let lastRenderedMessages = null;
let cachedRenderedData = {};

export default (renderedMessages: RenderedSectionDescriptor[]): Object => {
  if (lastRenderedMessages === renderedMessages) {
    return cachedRenderedData;
  }

  const messageList: Object[] = renderedMessages.reduce((result, section) => {
    result.push(
      <MessageListSection key={section.key} message={section.message} />,
      section.data.map(item => <MessageListItem {...item} />),
    );
    return result;
  }, []);

  const stickyHeaderIndices = messageList.reduce((indices, component, idx) => {
    if (component.type === MessageListSection) {
      indices.push(idx);
    }
    return indices;
  }, []);

  lastRenderedMessages = renderedMessages;
  cachedRenderedData = { messageList, stickyHeaderIndices };
  return cachedRenderedData;
};
