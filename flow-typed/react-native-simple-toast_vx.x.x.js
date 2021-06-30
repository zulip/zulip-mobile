// flow-typed signature: dfa621fc2221dbcc5c75aa37a073b542
// flow-typed version: <<STUB>>/react-native-simple-toast_v0.1.1/flow_v0.92.0

/**
 * Verbatim from index.d.ts.
 */

declare module 'react-native-simple-toast' {
  declare type SimpleToast = {|
    // Toast duration constants
    SHORT: number,
    LONG: number,

    // Toast gravity constants
    TOP: number,
    BOTTOM: number,
    CENTER: number,

    show: (message: string, duration?: number) => void,

    showWithGravity: (message: string, duration: number, gravity: number) => void,
  |};
  declare export default SimpleToast;
}

/**
 * We include stubs for each file inside this npm package in case you need to
 * require those files directly. Feel free to delete any files that aren't
 * needed.
 */

// Filename aliases
declare module 'react-native-simple-toast/index' {
  declare module.exports: $Exports<'react-native-simple-toast'>;
}
declare module 'react-native-simple-toast/index.js' {
  declare module.exports: $Exports<'react-native-simple-toast'>;
}
