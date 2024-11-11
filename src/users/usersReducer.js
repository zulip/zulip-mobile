/* @flow strict-local */
import type { User, UsersState, PerAccountApplicableAction } from '../types';
import {
  REGISTER_COMPLETE,
  EVENT_USER_ADD,
  EVENT_USER_REMOVE,
  EVENT,
  RESET_ACCOUNT_DATA,
} from '../actionConstants';
import { EventTypes } from '../api/eventTypes';
import { NULL_ARRAY } from '../nullObjects';

const initialState: UsersState = NULL_ARRAY;

export default (
  state: UsersState = initialState, // eslint-disable-line default-param-last
  action: PerAccountApplicableAction,
): UsersState => {
  switch (action.type) {
    case RESET_ACCOUNT_DATA:
      return initialState;

    case REGISTER_COMPLETE:
      return action.data.realm_users;

    case EVENT_USER_ADD:
      return [...state, action.person];

    case EVENT_USER_REMOVE:
      return state; // TODO

    case EVENT: {
      const { event } = action;
      switch (event.type) {
        case EventTypes.realm_user: {
          switch (event.op) {
            case 'update': {
              const { person } = event;
              // TODO(flow) teach Flow that the `person.existingUser != null` is redundant
              if (person.is_active === true && person.existingUser != null) {
                return [...state, person.existingUser];
              } else if (person.is_active === false) {
                return state.filter(u => u.user_id !== person.user_id);
              }
              return state.map(user => {
                if (user.user_id !== person.user_id) {
                  return user;
                }
                if (person.custom_profile_field) {
                  return {
                    ...user,
                    profile_data: (() => {
                      if (person.custom_profile_field.value !== null) {
                        return {
                          ...(user.profile_data: User['profile_data']),
                          [person.custom_profile_field.id]: ({
                            value: person.custom_profile_field.value,
                            rendered_value: person.custom_profile_field.rendered_value,

                            // FlowIssue: This assertion is cumbersome. But
                            // it fills a gap in Flow's coverage…that
                            // apparently Flow doesn't announce by marking
                            // anything with `any`. Remove when doing so
                            // doesn't stop Flow from catching something
                            // wrong on `value` or `rendered_value`.
                          }: $Values<$NonMaybeType<User['profile_data']>>),
                        };
                      } else {
                        // eslint-disable-next-line no-unused-vars
                        const { [person.custom_profile_field.id.toString()]: _, ...rest } =
                          user.profile_data ?? {};
                        return rest;
                      }
                    })(),
                  };
                } else if (person.new_email !== undefined) {
                  return { ...user, email: person.new_email };
                } else {
                  // eslint-disable-next-line no-unused-vars
                  const { existingUser, is_active, ...rest } = person;

                  // TODO(flow) Use `...person`, not `...rest`; teach Flow
                  //   that existingUser and is_active are absent in `person`;
                  //   see early-returns before the loop-through-users.
                  return { ...user, ...rest };
                }
              });
            }
            default:
              return state;
          }
        }
        default:
          return state;
      }
    }

    default:
      return state;
  }
};
