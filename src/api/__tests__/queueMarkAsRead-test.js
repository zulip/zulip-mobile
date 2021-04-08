/* @flow strict-local */
import queueMarkAsRead, { resetAll } from '../queueMarkAsRead';
import * as messagesFlags from '../messages/messagesFlags';
import * as eg from '../../__tests__/lib/exampleData';
import { Lolex } from '../../__tests__/lib/lolex';

// $FlowFixMe[cannot-write] Make flow understand about mocking
messagesFlags.default = jest.fn(
  (auth, ids, op, flag) =>
    new Promise((resolve, reject) => {
      resolve({ messages: ids, msg: '', result: 'success' });
    }),
);

describe('queueMarkAsRead', () => {
  let lolex: Lolex;

  beforeAll(() => {
    lolex = new Lolex();
  });

  afterAll(() => {
    lolex.dispose();
  });

  afterEach(() => {
    jest.clearAllMocks();
    lolex.clearAllTimers();
    resetAll();
  });

  test('should not call messagesFlags on consecutive calls of queueMarkAsRead,  setTimout on further calls', () => {
    queueMarkAsRead(eg.selfAuth, [1, 2, 3]);
    queueMarkAsRead(eg.selfAuth, [4, 5, 6]);
    queueMarkAsRead(eg.selfAuth, [7, 8, 9]);
    queueMarkAsRead(eg.selfAuth, [10, 11, 12]);

    expect(lolex.getTimerCount()).toBe(1);
    expect(messagesFlags.default).toHaveBeenCalledTimes(1);
  });

  test('should call messagesFlags, if calls to queueMarkAsRead are 2s apart', () => {
    queueMarkAsRead(eg.selfAuth, [13, 14, 15]);
    lolex.advanceTimersByTime(2100);
    queueMarkAsRead(eg.selfAuth, [16, 17, 18]);

    expect(messagesFlags.default).toHaveBeenCalledTimes(2);
  });

  test('should set timeout for time remaining for next API call to clear queue', () => {
    queueMarkAsRead(eg.selfAuth, [1, 2, 3]);

    lolex.advanceTimersByTime(1900);
    queueMarkAsRead(eg.selfAuth, [4, 5, 6]);

    lolex.runOnlyPendingTimers();
    expect(messagesFlags.default).toHaveBeenCalledTimes(2);
  });
});
