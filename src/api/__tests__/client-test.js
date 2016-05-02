jest.unmock('../client');

import ApiClient from '../client';

describe('ApiClient', () => {
  let apiClient;

  beforeEach(() => {
    apiClient = new ApiClient('testRealm');
  });

  it('should login a valid user', () => {
    console.log(apiClient);
  });

  it('should generate an auth header when logged in', () => {

  });
});
