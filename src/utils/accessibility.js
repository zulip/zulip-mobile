/* @flow */
export const textWithUnreadCount = (text: string, unreadCount: number = 0): string => {
  if (unreadCount === 0) {
    return text;
  }

  return `${text}, ${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`;
};
