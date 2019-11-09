declare module '@sentry/react-native' {
  // Despite being given as exact, many other options not listed here are
  // available. See:
  // * https://github.com/getsentry/sentry-react-native/blob/master/src/js/backend.ts
  // * https://github.com/getsentry/sentry-javascript/blob/master/packages/browser/src/backend.ts
  // * https://github.com/getsentry/sentry-javascript/blob/f4e59bcdd/packages/types/src/options.ts
  //
  // Please add them to this declaration as (and if) they're needed.
  declare export type Options = {|
    enabled?: boolean,
    dsn?: string,
    ignoreErrors?: Array<string | RegExp>,
  |};

  // Flow doesn't support true enums, so we split the TypeScript `enum Severity`
  // into a separate variable `Severity` and type `SeverityType`.
  declare export var Severity: {
    Fatal: 'fatal',
    Error: 'error',
    Warning: 'warning',
    Log: 'log',
    Info: 'info',
    Debug: 'debug',
    Critical: 'critical',
  };
  declare export type SeverityType = $Values<typeof Severity>;

  declare export type EventHint = {|
    event_id?: string,
    syntheticException?: Error | null,
    originalException?: Error | string | null,
    data?: mixed,
  |};

  declare export type Breadcrumb = {|
    type?: string,
    level?: SeverityType,
    event_id?: string,
    category?: string,
    message?: string,
    data?: any,
    timestamp?: number,
  |};

  declare export type Hub = {
    getClient(): Client | typeof undefined,

    captureException(exception: mixed, hint?: EventHint): string,
    captureMessage(message: string, level?: SeverityType, eventHint?: EventHint): string,
  };

  declare export type Client = {
    getOptions(): Options,
  };

  declare export function init(o: Options): void;
  declare export function getCurrentHub(): Hub;

  // a slice of the so-called "Static API":
  // https://docs.sentry.io/development/sdk-dev/unified-api/#static-api
  declare export default {
    captureException(exception: mixed): string,
    captureMessage(message: string, level?: $Values<typeof Severity>): string,
    addBreadcrumb(breadcrumb: Breadcrumb): void,
  };
}

