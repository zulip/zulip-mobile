/* @flow */
import React from 'react';
import isEqual from 'lodash.isequal';
import type { ChildrenArray } from 'react';

import type { Narrow, RenderedSectionDescriptor } from '../types';
import MessageListSection from './MessageListSection';
import MessageListItem from './MessageListItem';

let lastRenderedMessages = null;
let cachedRenderedData = {};

export default (
  narrow: Narrow,
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
          narrow={narrow}
          key={section.key}
          onLongPress={onLongPress}
          message={section.message}
        />,
        section.data.map(item => (
          <MessageListItem narrow={narrow} onLongPress={onLongPress} {...item} />
        )),
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
