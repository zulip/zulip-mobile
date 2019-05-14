/* @flow strict */
import type { ApiResponseError, ApiEventQueueResponseError } from './transportTypes';

/**
 * Base class for API Custom error classes
 */
class BaseApiError<T: ApiResponseError | ApiEventQueueResponseError> extends Error {
  data: T;
  httpStatus: number;

  constructor(httpStatus: number, data: T) {
    super(data.msg);
    this.data = data;
    this.httpStatus = httpStatus;
  }
}

/**
 * Custom error class, can be thrown by any caller of API function
 * if it results in a server-side error.
 */
export class ApiError extends BaseApiError<ApiResponseError> {}

/**
 * Custom error class thrown by the event queue processor in fatal error
 * cases that can not be resolved by retrying.
 */
export class EventQueueError extends BaseApiError<ApiEventQueueResponseError> {}

/**
 * The event queue is too old or has been garbage collected.
 * https://zulipchat.com/api/get-events-from-queue#bad_event_queue_id-errors
 */
export const isErrorBadEventQueueId = (e: Error | ApiError | EventQueueError): boolean =>
  (e instanceof ApiError || e instanceof EventQueueError) && e.data.code === 'BAD_EVENT_QUEUE_ID';

/**
 * Is exception caused by a Client Error (4xx)?
 *
 * Client errors are often caused by incorrect parameters given the back-end
 * by the client application.
 *
 * A notable difference between a Server (5xx) and Client (4xx) errors is that
 * a client error will not be resolved by waiting and retrying the same request.
 */
export const isClientError = (e: Error | ApiError | EventQueueError): boolean =>
  (e instanceof ApiError || e instanceof EventQueueError)
  && e.httpStatus >= 400
  && e.httpStatus <= 499;
