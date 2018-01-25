/* @flow */
import React from 'react';
import isEqual from 'lodash.isequal';
import type { ChildrenArray } from 'react';

import type { RenderedSectionDescriptor } from '../types';
import MessageListSection from './MessageListSection';
import MessageListItem from './MessageListItem';

let lastRenderedMessages = null;
let cachedRenderedData = {};

export default (
  renderedMessages: RenderedSectionDescriptor[],
  onLongPress: (messageId: number, target: string) => void,
): Object => {
  if (lastRenderedMessages === renderedMessages) {
    return cachedRenderedData;
  }

  if (!isEqual(lastRenderedMessages, renderedMessages)) {
    const rendered: Object[] = renderedMessages.reduce((result, section) => {
      result.push(
        <MessageListSection
          key={section.key}
          onLongPress={onLongPress}
          message={section.message}
        />,
        section.data.map(item => <MessageListItem onLongPress={onLongPress} {...item} />),
      );

      return result;
    }, []);
    const messageList: ChildrenArray<*> = React.Children.toArray(rendered);

    const stickyHeaderIndices = messageList
      .map((component, idx) => (component.type === MessageListSection ? idx + 1 : -1))
      .filter(idx => idx !== -1);

    cachedRenderedData = { messageList, stickyHeaderIndices };
  }

  lastRenderedMessages = renderedMessages;

  return cachedRenderedData;
};
