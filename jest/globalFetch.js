global.fetch = jest.fn();

fetch.mockResponseSuccess = body => {
  fetch.mockImplementation(() =>
    Promise.resolve({ json: () => Promise.resolve(JSON.parse(body)), status: 200, ok: true }),
  );
};

fetch.mockResponseFailure = error => {
  fetch.mockImplementation(() => Promise.reject(error));
};

fetch.mockErrorStatusCode = status => {
  fetch.mockImplementation({ status });
};

fetch.reset = () => {
  fetch.mockReset();
};
