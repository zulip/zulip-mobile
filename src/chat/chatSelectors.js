export const getPointer = (state) =>
  (state.messages.length === 0 ?
    [0, 0] :
    [state.messages[0].id, state.messages[state.messages.length - 1].id]);
