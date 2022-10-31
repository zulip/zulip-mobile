/* @flow strict-local */
import type {
  WebViewInboundEvent,
  WebViewInboundEventContent,
  WebViewInboundEventFetching,
  WebViewInboundEventTyping,
  WebViewInboundEventReady,
  WebViewInboundEventSetRead,
} from '../generateInboundEvents';
import type { JSONable } from '../../utils/jsonable';
import sendMessage from './sendMessage';
import { ensureUnreachable } from '../../types';

type Scrub<E: WebViewInboundEvent> = {| [key: $Keys<E>]: JSONable |};

type ScrubbedInboundEvent =
  | Scrub<WebViewInboundEventContent>
  | Scrub<WebViewInboundEventFetching>
  | Scrub<WebViewInboundEventTyping>
  | Scrub<WebViewInboundEventReady>
  | Scrub<WebViewInboundEventSetRead>;

type ScrubbedInboundEventItem = {|
  timestamp: number,
  type: 'inbound',
  scrubbedEvent: ScrubbedInboundEvent,
|};

/**
 * Grab interesting but not privacy-sensitive message-loading state.
 *
 * Takes the "content" from an inbound WebView event, an HTML string,
 * and returns the opening div#message-loading tag, so we know whether
 * it's visible.
 */
const placeholdersDivTagFromContent = (content: string): string | null => {
  const match = /<div id="message-loading" class="(?:hidden)?">/.exec(content);
  return match !== null ? match[0] : null;
};

export default class InboundEventLogger {
  _captureStartTime: number | void;
  _captureEndTime: number | void;
  _isCapturing: boolean;
  _capturedInboundEventItems: ScrubbedInboundEventItem[];

  /**
   * Minimally transform an inbound event to remove sensitive data.
   */
  static scrubInboundEvent(event: WebViewInboundEvent): ScrubbedInboundEvent {
    // Don't spread the event (e.g., `...event`); instead, rebuild it.
    // That way, a new property, when added, won't automatically be
    // sent to Sentry un-scrubbed.
    switch (event.type) {
      case 'content': {
        return {
          type: event.type,
          scrollMessageId: event.scrollMessageId,
          auth: 'redacted',
          content: placeholdersDivTagFromContent(event.content),
          scrollStrategy: event.scrollStrategy,
        };
      }
      case 'fetching': {
        return {
          type: event.type,
          showMessagePlaceholders: event.showMessagePlaceholders,
          fetchingOlder: event.fetchingOlder,
          fetchingNewer: event.fetchingNewer,
        };
      }
      case 'typing': {
        return {
          type: event.type,
          // Empty if no one is typing; otherwise, has avatar URLs.
          content: event.content !== '',
        };
      }
      case 'ready': {
        return {
          type: event.type,
        };
      }
      case 'set-read': {
        return {
          type: event.type,
          value: event.value,
          messageIds: event.messageIds,
        };
      }
      default: {
        ensureUnreachable(event);
        return {
          type: event.type,
        };
      }
    }
  }

  constructor() {
    this._isCapturing = false;
    this._capturedInboundEventItems = [];
  }

  startCapturing() {
    if (this._isCapturing) {
      throw new Error('InboundEventLogger: Tried to call startCapturing while already capturing.');
    } else if (this._capturedInboundEventItems.length > 0 || this._captureEndTime !== undefined) {
      throw new Error('InboundEventLogger: Tried to call startCapturing before resetting.');
    }
    this._isCapturing = true;
    this._captureStartTime = Date.now();
  }

  stopCapturing() {
    if (!this._isCapturing) {
      throw new Error('InboundEventLogger: Tried to call stopCapturing while not capturing.');
    }
    this._isCapturing = false;
    this._captureEndTime = Date.now();
  }

  send() {
    if (this._isCapturing) {
      throw new Error('InboundEventLogger: Tried to send captured events while still capturing.');
    }
    sendMessage({
      type: 'warn',
      details: {
        startTime: this._captureStartTime ?? null,
        endTime: this._captureEndTime ?? null,
        inboundEventItems: JSON.stringify(this._capturedInboundEventItems),
      },
    });
  }

  reset() {
    this._captureStartTime = undefined;
    this._captureEndTime = undefined;
    this._capturedInboundEventItems = [];
    this._isCapturing = false;
  }

  maybeCaptureInboundEvent(event: WebViewInboundEvent) {
    if (this._isCapturing) {
      const item = {
        type: 'inbound',
        timestamp: Date.now(),
        // Scrubbing up front, rather than just before sending, means
        // it might be a waste of work -- we may never send. But it's
        // not a *ton* of work, and it's currently the case that
        // scrubbed events are much lighter than unscrubbed ones
        // (unscrubbed events can have very long `content` strings).
        scrubbedEvent: InboundEventLogger.scrubInboundEvent(event),
      };
      this._capturedInboundEventItems.push(item);
    }
  }
}
