/* @noflow */
export default async (response: Object) => {
  if (!response.ok) {
    const error = new Error('API');
    error.response = response;
    const json = await response.json();
    error.msg = json.msg;
    throw error;
  }

  const json = await response.json();

  if (json.result !== 'success') {
    const error = new Error('API');
    error.response = response;
    error.code = json.code;
    error.msg = json.msg;
    throw error;
  }
  return json;
};
