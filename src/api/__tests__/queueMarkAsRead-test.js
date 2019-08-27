/* @flow strict-local */
import queueMarkAsRead, { resetAll } from '../queueMarkAsRead';
import * as messagesFlags from '../messages/messagesFlags';
import * as eg from '../../__tests__/exampleData';

// $FlowFixMe Make flow understand about mocking
messagesFlags.default = jest.fn(() => {});

jest.useFakeTimers();

describe('queueMarkAsRead', () => {
  beforeEach(() => {
    resetAll();
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  test('should not call messagesFlags on consecutive calls of queueMarkAsRead,  setTimout on further calls', () => {
    queueMarkAsRead(eg.selfAuth, [1, 2, 3]);
    queueMarkAsRead(eg.selfAuth, [4, 5, 6]);
    queueMarkAsRead(eg.selfAuth, [7, 8, 9]);
    queueMarkAsRead(eg.selfAuth, [10, 11, 12]);

    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(messagesFlags.default).toHaveBeenCalledTimes(1);
  });

  test('should call messagesFlags, if calls to queueMarkAsRead are 2s apart', () => {
    const start = Date.now();
    // $FlowFixMe Make flow understand about mocking
    Date.now = jest.fn().mockReturnValue(start);
    queueMarkAsRead(eg.selfAuth, [13, 14, 15]);

    // $FlowFixMe Make flow understand about mocking
    Date.now = jest.fn().mockReturnValue(start + 2100);
    queueMarkAsRead(eg.selfAuth, [16, 17, 18]);

    expect(messagesFlags.default).toHaveBeenCalledTimes(2);
  });

  test('should set timeout for time remaining for next API call to clear queue', () => {
    const start = Date.now();
    // $FlowFixMe Make flow understand about mocking
    Date.now = jest.fn().mockReturnValue(start);
    queueMarkAsRead(eg.selfAuth, [1, 2, 3]);

    // $FlowFixMe Make flow understand about mocking
    Date.now = jest.fn().mockReturnValue(start + 1900);
    queueMarkAsRead(eg.selfAuth, [4, 5, 6]);

    // $FlowFixMe Make flow understand about mocking
    Date.now = jest.fn().mockReturnValue(start + 2001);
    jest.runOnlyPendingTimers();
    expect(messagesFlags.default).toHaveBeenCalledTimes(2);
  });
});
