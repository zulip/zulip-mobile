declare module 'redux-mock-store' {
  /*
    S = State
    A = Action
  */

  declare type mockStore = { <S, A>(state: S): mockStoreWithoutMiddleware<S, A>, ... };
  declare interface Dispatch<S, A> {
    (action: A): A;
    <T>((Function, Function) => T): T;
  }

  declare type mockStoreWithoutMiddleware<S, A> = {
    getState(): S,
    getActions(): Array<A>,
    dispatch: Dispatch<S, A>,
    clearActions(): void,
    subscribe(callback: () => void): () => void,
    replaceReducer(nextReducer: Function): void,
    ...
  };

  declare type Middleware = (any) => any => any;

  declare module.exports: (middlewares: ?Array<Middleware>) => mockStore;
}

// Filename aliases
declare module 'redux-mock-store/src/index' {
  declare module.exports: $Exports<'redux-mock-store'>;
}
declare module 'redux-mock-store/src/index.js' {
  declare module.exports: $Exports<'redux-mock-store'>;
}
