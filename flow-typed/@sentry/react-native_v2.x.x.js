declare module '@sentry/react-native' {

  declare type Primitive =
    | number
    | string
    | boolean
    // | bigint (not supported yet; facebook/flow#6639)
    | symbol
    | null
    | typeof undefined;

  // Adapted from @sentry/types/src/options.ts et al.
  //
  // Despite being given as exact, many other options not listed here are
  // available. See:
  // * https://github.com/getsentry/sentry-react-native/blob/ca0a3121b/src/js/backend.ts
  // * https://github.com/getsentry/sentry-javascript/blob/f4e59bcdd/packages/browser/src/backend.ts
  // * https://github.com/getsentry/sentry-javascript/blob/f4e59bcdd/packages/types/src/options.ts
  //
  // Please add them to this declaration as (and if) they're needed.
  declare export type Options = {|
    /* Do not use this in Sentry.init(). As of 1.0.9, Sentry will only be
       partially initialized if it's set to `false`, and anyway there's no good
       way to toggle it. */
    // enabled?: boolean,

    /* This field is declared as optional in TypeScript, but it's not: the iOS
       implementation will redbox if it's omitted from the `init()` call. The
       underlying issue has been filed as getsentry/sentry-cocoa#347.

       In the meantime, { dsn: 'https://none@localhost:0/_/_' } may have the
       same effect. */
    dsn: string,

    ignoreErrors?: Array<string | RegExp>,
  |};

  // Adapted from @sentry/types/src/severity.ts.
  //
  // Flow doesn't support true enums, so we split the TypeScript `enum Severity`
  // into a separate variable `Severity` and type `SeverityType`.
  declare export var Severity: $ReadOnly<{
    Fatal: 'fatal',
    Error: 'error',
    Warning: 'warning',
    Log: 'log',
    Info: 'info',
    Debug: 'debug',
    Critical: 'critical',
  }>;
  declare export type SeverityType = $Values<typeof Severity>;

  // Taken from @sentry/types/src/event.ts.
  //
  // Commented-out members have types not (yet?) present in this file.
  declare export type Event = {|
    event_id?: string,
    message?: string,
    timestamp?: number,
    start_timestamp?: number;
    level?: SeverityType,
    platform?: string,
    logger?: string,
    server_name?: string,
    release?: string,
    dist?: string,
    environment?: string,
    // sdk?: SdkInfo,
    // request?: Request,
    transaction?: string,
    modules?: { [key: string]: string },
    fingerprint?: string[],
    // exception?: { values?: Exception[], },
    // stacktrace?: Stacktrace,
    breadcrumbs?: Breadcrumb[],
    // contexts?: { [key: string]: object },
    tags?: { [key: string]: Primitive },
    extra?: { [key: string]: any },
    // user?: User,
    type?: EventType,
  |};

  // Taken from @sentry/types/src/event.ts.
  declare export type EventType = 'transaction';

  // Taken from @sentry/types/src/event.ts.
  declare export type EventHint = {|
    event_id?: string,
    captureContext?: CaptureContext;
    syntheticException?: Error | null,
    originalException?: Error | string | null,
    data?: mixed,
  |};

  // Taken from @sentry/types/src/breadcrumb.ts.
  declare export type Breadcrumb = {|
    type?: string,
    level?: SeverityType,
    event_id?: string,
    category?: string,
    message?: string,
    data?: {
      [key: string]: mixed;
  },
    timestamp?: number,
  |};

  // Taken from @sentry/types/src/hub.ts. More methods are available.
  declare export type Hub = {
    getClient(): Client | typeof undefined,

    captureException(exception: mixed, hint?: EventHint): string,
    captureMessage(message: string, level?: SeverityType, hint?: EventHint): string,
  };

  // Taken from @sentry/{minimal,types}/src/scope.ts.
  // More methods are available.
  declare export class Scope {
    /**
     * Set an object that will be merged sent as tags data with the event.
     * @param tags Tags context object to merge into current context.
     */
    setTags(tags: {
      +[key: string]: Primitive,
    }): this;
    /**
     * Set key:value that will be sent as tags data with the event.
     * @param key String key of tag
     * @param value String value of tag
     */
    setTag(key: string, value: Primitive): this;
    /**
     * Set key:value that will be sent as extra data with the event.
     * @param key String of extra
     * @param extra Any kind of data. This data will be normalized.
     */
    setExtra(key: string, extra: any): this;

    /**
     * Set an object that will be merged sent as extra data with the event.
     * @param extras Extras object to merge into current context.
     */
    setExtras(extras: { +[key: string]: any }): this;
  }

  declare export type CaptureContext = Scope | Partial<ScopeContext> | ((scope: Scope) => Scope);

  // Adapted from @sentry/types/src/client.ts, with some specialization.
  declare export type Client = {
    getOptions(): Options,
  };

  // Adapted from @sentry/react-native/src/sdk.ts.
  declare export function init(o: Options): void;

  // Taken from @sentry/hub/src/hub.ts.
  declare export function getCurrentHub(): Hub;

  // A slice of the so-called "Static API":
  // https://docs.sentry.io/development/sdk-dev/unified-api/#static-api
  //
  // Taken from @sentry/minimal/src/index.ts.
  declare export function captureException(exception: mixed, captureContext?: CaptureContext): string;
  declare export function captureMessage(message: string, captureContext?: CaptureContext | SeverityType): string;
  declare export function addBreadcrumb(breadcrumb: Breadcrumb): void;

  /* Modifies the current scope. Avoid in favor of `withScope` wherever
     possible. */
  declare export function configureScope(callback: (scope: Scope) => void): void;

  /**
   * Performs actions in a new subscope.
   *
   * Note that an exception which escapes this scope will not necessarily have
   * the relevant scope-changes applied to its Sentry event! This scope is only
   * consulted when the event is finally captured for logging.
   */
  declare export function withScope(callback: (scope: Scope) => void): void;
}
