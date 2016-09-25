export const ERROR_OCCURED = 'ERROR_OCCURED';
export const ERROR_HANDLED = 'ERROR_HANDLED';

export const markErrorsAsHandled = (errors) =>
  (dispatch) => {
    if (!errors.isEmpty()) {
      dispatch({
        type: ERROR_HANDLED,
        errors,
      });
    }
  };
