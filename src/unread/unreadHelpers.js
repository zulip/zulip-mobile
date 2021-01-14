/* @flow strict-local */
import type { HuddlesUnreadItem, PmsUnreadItem, StreamUnreadItem, UserId } from '../types';
import { addItemsToArray, removeItemsFromArray, filterArray } from '../utils/immutability';

type SomeUnreadItem = { unread_message_ids: number[] };

export function removeItemsDeeply<T: SomeUnreadItem>(objArray: T[], messageIds: number[]): T[] {
  let changed = false;
  const objWithAddedUnreadIds = objArray.map(obj => {
    const filteredIds = removeItemsFromArray(obj.unread_message_ids, messageIds);
    if (filteredIds === obj.unread_message_ids) {
      return obj;
    }

    changed = true;
    return {
      ...obj,
      unread_message_ids: filteredIds,
    };
  });

  if (!changed) {
    return objArray;
  }

  return filterArray(
    objWithAddedUnreadIds,
    sender => sender && sender.unread_message_ids.length > 0,
  );
}

function addItemsDeeply<T: SomeUnreadItem>(input: T[], itemsToAdd: number[], index: number): T[] {
  const item = input[index];

  const unreadMessageIds = addItemsToArray(item.unread_message_ids, itemsToAdd);
  if (item.unread_message_ids === unreadMessageIds) {
    return input;
  }

  return [
    ...input.slice(0, index),
    {
      ...item,
      unread_message_ids: unreadMessageIds,
    },
    ...input.slice(index + 1),
  ];
}

export const addItemsToPmArray = (
  input: PmsUnreadItem[],
  itemsToAdd: number[],
  senderId: UserId,
): PmsUnreadItem[] => {
  const index = input.findIndex(sender => sender.sender_id === senderId);

  if (index !== -1) {
    return addItemsDeeply(input, itemsToAdd, index);
  }

  return [
    ...input,
    {
      sender_id: senderId,
      unread_message_ids: itemsToAdd,
    },
  ];
};

export const addItemsToHuddleArray = (
  input: HuddlesUnreadItem[],
  itemsToAdd: number[],
  userIds: string,
): HuddlesUnreadItem[] => {
  const index = input.findIndex(recipients => recipients.user_ids_string === userIds);

  if (index !== -1) {
    return addItemsDeeply(input, itemsToAdd, index);
  }

  return [
    ...input,
    {
      user_ids_string: userIds,
      unread_message_ids: itemsToAdd,
    },
  ];
};

export const addItemsToStreamArray = (
  input: StreamUnreadItem[],
  itemsToAdd: number[],
  streamId: number,
  topic: string,
): StreamUnreadItem[] => {
  const index = input.findIndex(s => s.stream_id === streamId && s.topic === topic);

  if (index !== -1) {
    return addItemsDeeply(input, itemsToAdd, index);
  }
  return [
    ...input,
    {
      stream_id: streamId,
      topic,
      unread_message_ids: itemsToAdd,
    },
  ];
};
