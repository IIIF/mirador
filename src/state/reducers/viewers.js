import { set, unset } from './utils';
import ActionTypes from '../actions/action-types';

/**
 * viewersReducer
 */
export const viewersReducer = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.UPDATE_VIEWPORT:
      return set(state, [action.windowId], action.payload);

    case ActionTypes.REMOVE_WINDOW:
      return unset(state, [action.windowId]);

    default:
      return state;
  }
};
