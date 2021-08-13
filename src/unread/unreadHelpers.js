/* @flow strict-local */
import type { HuddlesUnreadItem, PmsUnreadItem, UserId } from '../types';
import { addItemsToArray, removeItemsFromArray, filterArray } from '../utils/immutability';

type SomeUnreadItem = $ReadOnly<{ unread_message_ids: $ReadOnlyArray<number>, ... }>;

export function removeItemsDeeply<T: SomeUnreadItem>(
  objArray: $ReadOnlyArray<T>,
  messageIds: $ReadOnlyArray<number>,
): $ReadOnlyArray<T> {
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

function addItemsDeeply<T: SomeUnreadItem>(
  input: $ReadOnlyArray<T>,
  itemsToAdd: number[],
  index: number,
): $ReadOnlyArray<T> {
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
  input: $ReadOnlyArray<PmsUnreadItem>,
  itemsToAdd: number[],
  senderId: UserId,
): $ReadOnlyArray<PmsUnreadItem> => {
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
  input: $ReadOnlyArray<HuddlesUnreadItem>,
  itemsToAdd: number[],
  userIds: string,
): $ReadOnlyArray<HuddlesUnreadItem> => {
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
