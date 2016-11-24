export const getPointer = (state) => {
  const messages = state.messages.toJS();
  return (messages.length === 0 ?
    [0, 0] :
    [messages[0].id, messages[messages.length - 1].id]);
};
