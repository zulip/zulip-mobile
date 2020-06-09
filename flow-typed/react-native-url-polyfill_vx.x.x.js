declare module 'react-native-url-polyfill/js/URL' {
  import type { URLSearchParams } from 'react-native-url-polyfill/js/URLSearchParams';

  // https://github.com/facebook/flow/blob/v0.98.0/lib/dom.js#L3765-L3783
  declare export class URL {
    static createObjectURL(blob: Blob): string;
    static createObjectURL(mediaSource: MediaSource): string;
    static createFor(blob: Blob): string;
    static revokeObjectURL(url: string): void;
    constructor(url: string, base?: string | URL): void;
    hash: string;
    host: string;
    hostname: string;
    href: string;
    origin: string; // readonly
    password: string;
    pathname: string;
    port: string;
    protocol: string;
    search: string;
    searchParams: URLSearchParams; // readonly
    username: string;
  }
}

declare module 'react-native-url-polyfill/js/URLSearchParams' {
  // https://github.com/facebook/flow/blob/v0.98.0/lib/bom.js#L1000-L1013
  declare export class URLSearchParams {
    @@iterator(): Iterator<[string, string]>;
    constructor(
      query?: string | URLSearchParams | Array<[string, string]> | { [string]: string },
    ): void;
    append(name: string, value: string): void;
    delete(name: string): void;
    entries(): Iterator<[string, string]>;
    forEach((value: string, name: string, params: URLSearchParams) => any, thisArg?: any): void;
    get(name: string): null | string;
    getAll(name: string): Array<string>;
    has(name: string): boolean;
    keys(): Iterator<string>;
    set(name: string, value: string): void;
    values(): Iterator<string>;
  }
}

// Filename aliases
declare module 'react-native-url-polyfill/index' {
  declare module.exports: $Exports<'react-native-url-polyfill'>;
}
declare module 'react-native-url-polyfill/index.js' {
  declare module.exports: $Exports<'react-native-url-polyfill'>;
}
declare module 'react-native-url-polyfill/js/URL.js' {
  declare module.exports: $Exports<'react-native-url-polyfill/js/URL'>;
}
declare module 'react-native-url-polyfill/js/URLSearchParams.js' {
  declare module.exports: $Exports<'react-native-url-polyfill/js/URLSearchParams'>;
}

declare module 'react-native-url-polyfill' {
  declare export * from 'react-native-url-polyfill/js/URL'
  declare export * from 'react-native-url-polyfill/js/URLSearchParams'
}
