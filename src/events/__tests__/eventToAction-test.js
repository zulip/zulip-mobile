import { operationToEvent } from '../eventToAction';

describe('operationToEvent', () => {
  test('returns action depending on operation', () => {
    expect(operationToEvent('add', ['action_add', 'action_remove'])).toBe('action_add');
    expect(operationToEvent('remove', ['action_add', 'action_remove'])).toBe('action_remove');
    expect(operationToEvent('update', ['action_add', 'action_remove'])).toBe(undefined);
  });
});
