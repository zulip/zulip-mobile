import { handlePendingNotifications } from '../notifications';

describe('handlePendingNotifications', () => {
  test('does not throw if `notificationData` value is not as expected', () => {
    expect(() => handlePendingNotifications()).not.toThrow();
    expect(() => handlePendingNotifications({})).not.toThrow();
  });

  test('if no data is extracted dispatch nothing', () => {
    const notificationData = { getData: () => undefined };
    const dispatch = jest.fn();

    handlePendingNotifications(notificationData);

    expect(dispatch).not.toHaveBeenCalled();
  });

  test('if some data is passed dispatch a message', () => {
    const notificationData = { getData: () => ({}) };
    const dispatch = jest.fn();

    handlePendingNotifications(notificationData, dispatch);

    expect(dispatch).toHaveBeenCalled();
  });
});
