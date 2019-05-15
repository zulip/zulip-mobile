import { isErrorBadEventQueueId, EventQueueError } from '../apiErrors';

describe('isErrorBadEventQueueId', () => {
  test('not any Error object is a "bad event queue id" error', () => {
    const error = new Error();
    const result = isErrorBadEventQueueId(error);
    expect(result).toBe(false);
  });

  test('custom error of type "EventQueueError" and "BAD_EVENT_QUEUE_ID" returns true', () => {
    const data = {
      code: 'BAD_EVENT_QUEUE_ID',
      msg: 'Bad event queue id: 123',
      queue_id: '123',
      result: 'error',
    };
    const error = new EventQueueError(400, data);
    const result = isErrorBadEventQueueId(error);
    expect(result).toBe(true);
  });
});
