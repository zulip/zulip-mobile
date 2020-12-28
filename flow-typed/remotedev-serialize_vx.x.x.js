/**
 * From DefinitelyTyped
 * (https://github.com/DefinitelyTyped/DefinitelyTyped/blob/55ebcedca/types/remotedev-serialize/index.d.ts)
 * via FlowGen v1.10.0, with minimal manual tweaks (run
 *
 * `git log --stat -p --full-diff -- flow-typed/remotedev-serialize_vx.x.x.js`
 *
 * for info).
 */
declare module 'remotedev-serialize' {
  declare export type Options = { [key: string]: boolean, ... };
  declare export type Refs = { [key: string]: any, ... };
  declare export type DefaultReplacer = (key: string, value: any) => any;
  declare export type Replacer = (key: string, value: any, replacer: DefaultReplacer) => any;
  declare export type DefaultReviver = (key: string, value: any) => any;
  declare export type Reviver = (key: string, value: any, reviver: DefaultReviver) => any;
  declare export function immutable(
    // This `any` is unavoidable; see
    // https://github.com/flow-typed/flow-typed/blob/master/CONTRIBUTING.md#dont-import-types-from-other-libdefs.
    immutable: any,
    refs?: Refs | null,
    customReplacer?: Replacer,
    customReviver?: Reviver,
  ): {
    stringify: (input: any) => string,
    parse: (input: string) => any,
    serialize: (
      immutable: any,
      refs?: Refs,
      customReplacer?: Replacer,
      customReviver?: Reviver,
    ) => {
      replacer: Replacer,
      reviver: Reviver,
      options: Options,
      ...
    },
    ...
  };
}
