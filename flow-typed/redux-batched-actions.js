declare module 'redux-batched-actions' {
  // Copied from redux libdef, following how react-redux libdef does it.
  declare type Reducer<S, A> = (state: S | void, action: A) => S;

  declare export function enableBatching<S, A, R: Reducer<S, A>>(reducer: R): R;

  // TODO deal with this another day.
  declare export var batchActions: any;
}
